'use strict'
const fs = require('fs');
const request = require('superagent');
const cheerio = require('cheerio');
const async = require('async');
const path = require('path')
let page = 1;
const SEARCH_URL = 'http://www.mm131.com/xinggan/3999.html';

function getPic() {
    async.waterfall([
            function (callback) {
                let url;
                if (page == 1) {
                    url = SEARCH_URL;
                    callback(null, url)
                } else {
                    const str = SEARCH_URL.slice(0, -5);
                    url = `${str}_${ page }.html`;
                    callback(null, url)
                }
            },
            function (url, callback) {
                request.get(url).then((res) => {
                    callback(null, res.text, url)
                }, (e) => {
                    callback('结束', '结束')
                })
            },
            function (html, url, callback) {
                let $ = cheerio.load(html);
                let srcArr = Array.from($('.content-pic img').map(function () {
                    return $(this).attr('src')
                }))
                callback(null, srcArr, url)
            },
            function (srcArr, url, callback) {
                srcArr.forEach(function (item, indx) {
                    let stream = fs.createWriteStream('images/' + path.basename(item));
                    request
                        .get(item)
                        .set('Referer', url)
                        .pipe(stream);
                    callback(null, `成功获得第${page}张图`)
                })
            }
        ],

        function (err, result) {
            if (err){
                console.log(err)
            }else{
                console.log(result)
                ++page
                getPic()
            }
        })
}
getPic()
