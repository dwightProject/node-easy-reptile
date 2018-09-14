'use strict'
const fs = require('fs');
const request = require('superagent');
const cheerio = require('cheerio');
const path = require('path')
let page = 1;
const SEARCH_URL = 'http://www.mm131.com/xinggan/2333.html';
let linkGroup = []

async function getPic() {
    try {
        let links = await getLinksByPage(1);
        await getImage(links)
    } catch (e) {
        console.log(e)
    }
}
getPic();
async function getLinksByPage(page) {
    try {
        console.log('刚扒了一页。。。。')
        let html = await requestUrl(page);
        if (html == 'not found') {
            return linkGroup;
        }
        let imgSrc = getImgSrc(html);
        Array.prototype.push.apply(linkGroup, imgSrc);
        return getLinksByPage(++page);
    } catch (e) {
        console.log(e)
    }
}

async function requestUrl(page) {
    let url =  getSerchUrl(page)
    return request.get(url).then((res) => {
        return res.text
    }, (e) => {
        return 'not found'
    })
}

function getImgSrc(html) {
    let $ = cheerio.load(html);
    return Array.from($('.content-pic img').map(function () {
        return $(this).attr('src')
    }))
}

function  getSerchUrl(page) {
    let url;
    if (page == 1) {
        url = SEARCH_URL;
    } else {
        const str = SEARCH_URL.slice(0, -5);
        url = `${str}_${ page }.html`;
    }
    return url
}

function getImage(url) {
    let sear = getSerchUrl()
    url.forEach(function (item,index) {
        let stream  = fs.createWriteStream('images/' + path.basename(item));
        if(index == url.length-1){
            console.log('扒玩，正在生成图片')
        }
        request
            .get(item)
            .set('Referer',sear)
            .pipe(stream);
    })
}