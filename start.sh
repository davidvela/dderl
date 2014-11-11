#!/bin/bash

# Parameters:  NodeID ClusterID IMEMPort DDERLPort

nid=$1
cid=$2
port=$3
dderlport=$4
if [ "$#" -ne 3 ]; then
    nid=1
    cid=2
    port=1236
    dderlport=8443
fi

unamestr=`uname`
host=`hostname`
hostArrayIn=(${host//./ })
host=${hostArrayIn[0]}
name=dderl$nid@$host
cmname=dderl$cid@$host
imemtyp=disc
ck=dderl
if [[ "$unamestr" == 'Linux' ]]; then
     exename=erl
else
    exename='start //MAX werl.exe'
    #exename='erl.exe'
fi

# Node name
node_name="-sname $name"

# Cookie
cookie="-setcookie $ck"

# PATHS
paths="-pa"
paths=$paths" $PWD/ebin"
paths=$paths" $PWD/deps/*/ebin"

# Kernel Opts
kernel_opts="-kernel"
kernel_opts=$kernel_opts" inet_dist_listen_min 7000"
kernel_opts=$kernel_opts" inet_dist_listen_max 7020"

# Imem Opts
imem_opts="-imem"
imem_opts=$imem_opts" mnesia_node_type $imemtyp"
imem_opts=$imem_opts" erl_cluster_mgrs ['$cmname']"
imem_opts=$imem_opts" mnesia_schema_name dderl"
imem_opts=$imem_opts" tcp_port $port"

# dderl opts
dderl_opts="-dderl"
dderl_opts=$dderl_opts" port $dderlport" 

start_opts="$paths $cookie $node_name $kernel_opts $imem_opts $dderl_opts"

# CPRO start options
echo "------------------------------------------"
echo "Starting CPRO (Opts)"
echo "------------------------------------------"
echo "Node Name : $node_name"
echo "Cookie    : $cookie"
echo "EBIN Path : $paths"
echo "Kernel    : $kernel_opts"
echo "IMEM      : $imem_opts"
echo "DDERL     : $dderl_opts"
echo "------------------------------------------"

# Starting cpro
$exename $start_opts -s dderl
