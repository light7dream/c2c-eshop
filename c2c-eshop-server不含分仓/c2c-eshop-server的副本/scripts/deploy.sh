status=`git status | grep 'On branch' | awk '{print $3}'`
echo $status
if [ $status != "master" ]
then
  echo "当前不是master分支，请切换到master分支再部署。"
  exit 1
fi
git pull
rm -rf server-deploy.tar.gz
echo "tar czf server-deploy.tar.gz --exclude ./node_modules --exclude ./.git --exclude ./public --exclude ./server_modules/cert ./server_modules"
# 本地package.json和服务器不一致
tar czf server-deploy.tar.gz --exclude ./node_modules --exclude ./scripts/es --exclude ./.git --exclude ./public --exclude ./server_modules/cert ./server_modules
host=$1
scp server-deploy.tar.gz root@$host:/usr/local/apiserver
cmd="cd /usr/local/apiserver"
cmd="$cmd && mkdir -p eshop-server"
cmd="$cmd && tar xzf server-deploy.tar.gz -C eshop-server"
cmd="$cmd && rm -rf server-deploy.tar.gz"
cmd="$cmd && cd eshop-server"
cmd="$cmd && pm2 reload eshop-server --update-env --log-date-format 'DD-MM HH:mm:ss.SSS'"
ssh root@$host $cmd