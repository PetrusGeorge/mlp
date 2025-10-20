import subprocess
import argparse
import tempfile
import os
import sys
import pandas as pd
import concurrent.futures
import psutil as pU

data_dir = "../mlp_testao"
###data_dir = "../mlp_tudao"

def get_branch():
    out = subprocess.check_output(['git', 'branch']).decode('utf-8').split('\n')
    for b in out:
        if b.find('*') != -1:
            branch = b.replace('*', '').replace(' ', '')
            return branch

def ds_open(lang_name):
    ds_path = os.path.join(data_dir, lang_name + ".csv")

    if os.path.isfile(ds_path):
        df = pd.read_csv(ds_path)
    else:
        os.system('cp data/template.csv ' + ds_path)
        df = pd.read_csv(ds_path)

    return df

def get_mem_avg(pid):

    p = pU.Process(pid=pid)
    MB = 1024**2

    gap = 1e-10
    
    mem_max = -99999
    mem_avg = 0
    count = 0
    while True:
        with p.oneshot():
            if p.status() == pU.STATUS_ZOMBIE:
                print(p.status())
                break

            mem = p.memory_info()
            mem_total = (float(mem.rss)- float(mem.shared))/ MB
            if mem_total < gap:
                print("break by gap")
                break
            elif mem_total > mem_max:
                mem_max = mem_total

            mem_avg += mem_total
        count += 1

    mem_avg /= count

    return {"mem_avg" : mem_avg, "mem_max" : mem_max, "mem_lookups" : count}

def get_COST(_str):
    lines = _str.split("\n")

    for l in lines :
        #print(l)
        if l.find("COST") != -1:
            i = l.find(":")
            val = float(l[i+1:].replace(',', '.'))
            return val

def get_TIME(_str):
    lines = _str.split("\n")

    for l in lines :
        #print(l)
        if l.find("TIME") != -1:
            i = l.find(":")
            val = float(l[i+1:].replace(',', '.'))
            return val
    return

def get_info(lang):
    f = open('run_' + lang + '.sh', 'r')
    #print(f.readline())
    f.readline()
    cmd_line = f.readline().replace('\n', '').split(' ')
    print(cmd_line)

    with tempfile.TemporaryFile() as tempf:
        proc = subprocess.Popen(cmd_line, stdout=tempf)
        pid = proc.pid

        info = get_mem_avg(pid)

        proc.wait()
        tempf.seek(0)
        output = str(tempf.read().decode("utf-8"))
        
        COST = get_COST(output)
        TIME = get_TIME(output)
        info.update({"COST" : [COST], "TIME" : [TIME]})
        print(info)

        return info

    f.close()

def run_parallel_tests(lang, n_runs):
    all_results = []
    
    with concurrent.futures.ThreadPoolExecutor() as executor:
        # Submit n runs of get_info with the same lang parameter
        futures = [executor.submit(get_info, lang) for _ in range(n_runs)]
        
        # Collect results as they complete
        for future in concurrent.futures.as_completed(futures):
            try:
                result = future.result()
                all_results.append(result)
            except Exception as e:
                print(f"Test failed: {e}")
                all_results.append({"error": str(e)})
    
    return all_results

def main():

    parser = argparse.ArgumentParser(description='Run Benchmark')
    parser.add_argument('-i' ,'--instance', help='Path to the instance file.', required= not ('--instances-list' in sys.argv or '-I' in sys.argv ))
    parser.add_argument('-I' ,'--instances-list', help='Path to the file with a list of the paths of the instances.', required=not ('-i' in sys.argv or '--instance' in sys.argv))
    parser.add_argument('-n' , default=1, type=int, help='Number of times each language will run opa opa opa')
    parser.add_argument('--par' , default=False, type=bool, help='Run in parallel')
    parser.add_argument('--lang' , nargs='+', required=True, help='Sources: python3, java, mcs, dotnet, julia, cpp, lua, javascript, matlab, golang')    
    parser.add_argument('--out' ,  default=data_dir,  help='Output dir')
    args = parser.parse_args()

    sources = ["java", "dotnet", "mcs", "python3", "pypy", "julia", "cpp", "cppOOP",
            "fortran", "node", "lua", "luajit", "rust", "octave", "c", "swift", "golang"]

    for i in args.lang:
        if i not in sources:
            print("{} is not suported".format(i))
            exit(0)

    sources = args.lang[:]
    instances = []
    if args.instance is not None:
        instances.append(args.instance)
    else:
        instances = open(args.instances_list, 'r')

    n = args.n

    lang_dir = {
            "dotnet": "csharp",
            "mcs": "csharp",
            "java": "java",
            "python3": "python",
            "pypy": "python",
            "julia": "julia",
            "cpp" : "cplusplus",
            "cppOOP" : "cppOOP",
            "c" : "c",
            "fortran" : "fortran",
            "node" : "javascript",
            "lua" : "lua",
            "luajit" : "lua",
            "rust" : "rust",
            #"octave" : "octave",
            # "matlab" : "octave",
            "swift" : "swift",
            "golang" : "go"
            }

    """
    pnames = {
            "java" : "java",
            "csharp" : "cli",
            }
    """

    if not os.path.isdir(data_dir):
        os.mkdir(data_dir)
    
    os.chdir("mlp-instances/loader")
    os.system("make")
    os.chdir("../../")
    for inst in instances:
        os.chdir("mlp-instances/")
        os.system("./load " + inst)
        os.chdir("../")

        for lang in sources:
            ds = ds_open(lang_dir[lang])
            
            os.chdir(lang_dir[lang])
            print(os.getcwd())

            # IDEIA: criar arquivo cm lista de sources no dir de cada lang p gerar o nome do respectivo shell script "build_<source_name>.sh"
            if os.path.isfile("./build.sh"):
                # compila oq eh necessario
                os.system("./build.sh")

            infos = []
            if args.par:
                infos = run_parallel_tests(lang, n)
            else:
                for _ in range(n):
                    infos.append(get_info(lang))
                    
            for info in infos:
                # if lang == 'rust':
                #     os.system("./build.sh")

                info = get_info(lang)
                info.update({"source" : lang, "instance" : inst, "branch" : get_branch()})

                ds = pd.concat([ds, pd.DataFrame(info)], ignore_index=True)

                print(ds)

            ds.to_csv(os.path.join('..', data_dir,  lang_dir[lang] + '.csv'), index=False)

            os.chdir("..")

main()
