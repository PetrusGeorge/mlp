#! /usr/bin/bash
rm *.class | true
javac -O  main.java -Xlint:unchecked
