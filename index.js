const superagent = require('superagent');
const cheerio = require('cheerio');
const async = require('async');
const chalk = require('chalk');
const log = console.log;
const browserMsg = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.71 Safari/537.36",
    'Content-Type': 'application/x-www-form-urlencoded'
};

console.log('爬虫程序开始运行......');

function getHouseLeaseInfo(url) {
    return new Promise((resolve,reject)=>{
        superagent.get(url)
        .set(browserMsg)
        .end((err,response)=>{
            if(err){
                log(chalk.red('尼玛'));
                console.log(err);
                reject(err);
                return;
            }
            // console.log(response.text);
            let $ = cheerio.load(response.text);
            let $infoList = $('.zu-itemmod');
            let houseInfoList = [];
            $infoList.each((index,elem)=>{
                let item = {};
                item.title = $(elem).find('.zu-info>h3>a').text();
                let infoArr = $(elem).find('.details-item.tag').text().replace(/\\n/,"").trim().split('|');
                item.type = infoArr[0];
                item.area = infoArr[1].replace('平米',"");
                item.price = $(elem).find('.zu-side').text().replace(/\\n/,"").trim().replace(/[^\d]+/,"");
                item.rentUrl = $(elem).find('.zu-info>h3>a').attr('href');
                houseInfoList.push(item);
            });
            console.log(houseInfoList.filter(item=>{
                return item.area>=45 && item.price<=2200 && item.type.match(/[1厅|一厅]/);
            }));
            resolve(houseInfoList);
        });
    });
}


let urls = [];
for (let i = 1; i <= 20; i++) {
    urls.push(`https://hz.zu.anjuke.com/fangyuan/xihu/fx1-l2-p${i}-x1/`);
}




async.mapLimit(urls, 5, async function (url) {
    return await getHouseLeaseInfo(url);
}, (err, results) => {
    if (err) throw err;
    // results is now an array of the response bodies
    // console.log(results);
});
// let globalCookies = "";

// function login(url,data) {
//     return new Promise((resolve,reject)=>{
//         superagent.get(url)
//             .set(browserMsg)
//             .query(data).redirects(0)
//             .end((err,response)=>{
//                 if(err){
//                     log(chalk.red('尼玛'));
//                     console.log(err);
//                     globalCookies = "";
//                     reject(err);
//                     return;
//                 }
//                 globalCookies = response.headers["set-cookie"];
//                 log(chalk.green(globalCookies));
//                 console.log(response.text);
//                 resolve("登录成功");
//             });
//     });
// }

// function getGoodsList() {
//     superagent.get('http://openapi.daily.heyean.com/gateway.htm?command=syt_v2_tag_goods_list')
//         .set(browserMsg)
//         .set("Cookie",globalCookies)
//         .end((err,response)=>{
//             if(err){
//                 log(chalk.red(err));
//                 return;
//             }
//             console.log(response.text);
//         });
// }
//
// login('http://openapi.daily.heyean.com/gateway.htm?command=syt_v2_login',{
//     merchantCode:'A00300100000035',
//     userCode:'001',
//     userPwd:'111111'
// }).then(()=>{
//     getGoodsList();
// });
