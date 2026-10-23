import { chromium } from '@playwright/test';
import { readFileSync,writeFileSync,mkdirSync } from 'node:fs';
const browser=await chromium.launch({headless:true});
try {
 const page=await browser.newPage({viewport:{width:1024,height:1024},deviceScaleFactor:1});
 await page.setContent(`<html><body style="margin:0">${readFileSync('public/icon.svg','utf8')}</body></html>`);
 await page.screenshot({path:'ios/App/App/Assets.xcassets/AppIcon.appiconset/PhimIcon.png'});
 writeFileSync('ios/App/App/Assets.xcassets/AppIcon.appiconset/Contents.json',JSON.stringify({images:[{filename:'PhimIcon.png',idiom:'universal',platform:'ios',size:'1024x1024'}],info:{author:'xcode',version:1}},null,2));
 mkdirSync('docs/screenshots',{recursive:true});
 for(const [name,width,height] of [['desktop',1440,1080],['ipad',1024,1366],['iphone',414,896]]){
  await page.setViewportSize({width,height});await page.goto('http://127.0.0.1:5173/');await page.waitForSelector('.hero');await page.screenshot({path:`docs/screenshots/${name}.png`,fullPage:true});
 }
}finally{await browser.close();}
