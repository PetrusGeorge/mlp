{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    nixpkgs-stable.url = "github:NixOS/nixpkgs/nixos-25.05";

  };
  outputs = { self, nixpkgs, nixpkgs-stable, flake-utils, }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {inherit system; };
        pkgs-stable = import nixpkgs-stable {inherit system; };
      in
      {
        devShells.default = pkgs.mkShell.override {stdenv = pkgs.swift.stdenv; } {
          buildInputs = with pkgs;[
            stdenv.cc
            gfortran
            go
            jdk
            nodejs
            julia
            lua
            luajit
            python3
            pkgs-stable.pypy3
            rustc
            cargo
            mono
            dotnet-sdk
            swift
            swiftpm
            swift-corelibs-libdispatch
          ];

          DOTNET_ROOT="${pkgs.dotnet-sdk}/share/dotnet";
          LD_LIBRARY_PATH="${pkgs.swift-corelibs-libdispatch}/lib";
        };
      });
}
