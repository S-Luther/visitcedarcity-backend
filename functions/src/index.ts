import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as puppeteer from 'puppeteer';
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

admin.initializeApp();

export const BrianHeadMountainDataPropogater = functions
    .runWith({ timeoutSeconds: 60, memory: "1GB" })
    .pubsub
    .schedule('every 24 hours').onRun(async context => {  
    
        functions.logger.info("Hello logs!", {structuredData: true});


            const url = 'https://www.brianhead.com';
            const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
            const page = await browser.newPage();
            await page.goto(url);
            await page.waitFor(5000);


            const baseDepth = await page.$(".w153_acf_option_bh_snr_snow_basedepth");
            const baseDepthText = await page.evaluate(element => element.textContent, baseDepth);
            functions.logger.info("Base Depth: "+baseDepthText, {structuredData: true});

            const onedaySnowfall = await page.$(".w1-number.w153_acf_option_bh_snr_snow_24hour");
            const onedaySnowfallText = await page.evaluate(element => element.textContent, onedaySnowfall);
            functions.logger.info("24hr Snowfall: "+onedaySnowfallText, {structuredData: true});

            const liftsOpen = await page.$(".w1-number.w153_acf_option_bh_snr_lifts_open");
            const liftsOpenText = await page.evaluate(element => element.textContent, liftsOpen);
            functions.logger.info("Lifts Open: "+liftsOpenText, {structuredData: true});

            const trailsOpen = await page.$(".w1-number.w153_acf_option_bh_snr_trails_open");
            const trailsOpenText = await page.evaluate(element => element.textContent, trailsOpen);
            functions.logger.info("Trails Open: "+trailsOpenText, {structuredData: true});

            const temp = await page.$(".w153_pl_bh_option_weather_temperature");
            const tempText = await page.evaluate(element => element.textContent, temp);
            functions.logger.info("Brian Head Temp: "+tempText, {structuredData: true});

            const conditions = await page.$(".w153_pl_bh_option_weather_shortForecast");
            const conditionsText = await page.evaluate(element => element.textContent, conditions);
            functions.logger.info("Brian Head Conditions: "+conditionsText, {structuredData: true});

            const wind = await page.$(".w1-line2.w153_pl_bh_option_weather_wind");
            const windText = await page.evaluate(element => element.textContent, wind);
            functions.logger.info("Brian Head Wind: "+windText, {structuredData: true});

            await admin.firestore().collection('mountainData').add({
                Date: new Date(),
                baseDepth: baseDepthText,
                onedaySnowfall: onedaySnowfallText,
                liftsOpen: liftsOpenText,
                trailsOpen: trailsOpenText,
                temp: tempText,
                conditions: conditionsText,
                wind: windText,
            })

            await admin.firestore().collection('mountainData').doc("current").update({
                Date: new Date(),
                baseDepth: baseDepthText,
                onedaySnowfall: onedaySnowfallText,
                liftsOpen: liftsOpenText,
                trailsOpen: trailsOpenText,
                temp: tempText,
                conditions: conditionsText,
                wind: windText,
            })


            
            await browser.close();
     

    });



async function getWeather(url: string, name: string){
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.goto(url);
    await page.waitFor(5000);


    const temp = await page.$(".city-temp");
    const tempText = await page.evaluate(element => element.textContent, temp);
    functions.logger.info("Temp: "+tempText, {structuredData: true});

    const conditions = await page.$(".city-icon");
    const conditionsText = await page.evaluate(element => element.src, conditions);
    functions.logger.info("Conditions: "+conditionsText, {structuredData: true});


    await admin.firestore().collection(name+'WeatherDayData').add({
        Date: new Date(),
        temp: tempText,
        conditions: conditionsText,
    })

    await admin.firestore().collection(name+'WeatherDayData').doc("current").update({
        Date: new Date(),
        temp: tempText,
        conditions: conditionsText,
    })



    
    await browser.close();
}


export const WeatherDataPropogater = functions
    .runWith({ timeoutSeconds: 60, memory: "1GB" })
    .pubsub
    .schedule('every 1 hours').onRun(async context => {  
    
        functions.logger.info("Hello logs!", {structuredData: true});


        await getWeather('https://flipclocky.web.app/cedarcity.html', 'CedarCity')
        await getWeather('https://flipclocky.web.app/parowon.html', 'Parowan')
        await getWeather('https://flipclocky.web.app/brianhead.html', 'BrianHead')

     

    });


export const pubsubtest = functions
    .runWith({ timeoutSeconds: 60, memory: "1GB" })
    .pubsub
    .schedule('every 3 hours').onRun(async context => {  

        functions.logger.info("Hello logs!", {structuredData: true});

        const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
        const page = await browser.newPage();
        await page.goto('http://511.commuterlink.utah.gov/tats.web.report/')
        await page.waitFor(5000);

        const Cedar = await page.$("#GridInterstates_ctl00__19");
        const CedarText = await page.evaluate(element => element.innerHTML, Cedar);
        functions.logger.info(CedarText, {structuredData: true});
        const Parowan = await page.$("#GridInterstates_ctl00__18");
        const ParowanText = await page.evaluate(element => element.innerHTML, Parowan);
        const Brian = await page.$("#GridMtnOutsideSL_ctl00__15");
        const BrianText = await page.evaluate(element => element.innerHTML, Brian);
        const Nevada = await page.$("#GridSouth_ctl00__12");
        const NevadaText = await page.evaluate(element => element.innerHTML, Nevada);
        const LongVal = await page.$("#GridSouth_ctl00__5");
        const LongValText = await page.evaluate(element => element.innerHTML, LongVal);
        functions.logger.info(ParowanText, {structuredData: true});
        await admin.firestore().collection('RoadConditions').doc("current").update({
            CedarText: CedarText,
            ParowanText: ParowanText,
            BrianText: BrianText,
            NevadaText: NevadaText,
            LongValText: LongValText,
        })
    
    
    
        
        await browser.close();



});