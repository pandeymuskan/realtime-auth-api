const Redis=require('ioredis');

const redis=new Redis(process.env.REDIS_URL);

async function getCache(key)
{
    return redis.get(key);
}
async function setCashe(key,value,ttlsec)
{
    if(ttlsec)
    { 
       return redis.set(key,value,'EX',ttlsec);
    }
    return redis.set(key,value);
}

async function delCache(key)
{
    return redis.del(key);
}

module.exports={redis,getCache,setCashe,delCache};