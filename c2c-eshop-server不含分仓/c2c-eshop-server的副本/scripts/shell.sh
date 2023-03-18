# nginx

cd /usr/local
mkdir nginx
cd nginx
wget http://nginx.org/download/nginx-1.13.7.tar.gz
tar -xvf nginx-1.13.7.tar.gz

cd /usr/local/nginx
cd nginx-1.13.7
yum -y install pcre-devel openssl openssl-devel

./configure --prefix=/usr/local/nginx --with-http_stub_status_module --with-http_ssl_module
make
make install
cd /usr/local/nginx
scp 8.142.134.247:/usr/local/nginx/conf/nginx.conf ./conf/

ln -s /usr/local/nginx/sbin/nginx /usr/local/bin/

mkdir cert