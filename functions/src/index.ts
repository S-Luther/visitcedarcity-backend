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

// [
//     {
//       id: 1,
//       title: "Vermillion Castle",
//       subtitle: "Brian Head Area Trails",
//       url: "https://visitcedarcity.com/things-to-do/outdoor-activities/outdoor-activities/",
//       description: "2 mile, Out-and-Back type trail accessible Late Spring though Fall.",
//       image: "https://www.visitbrianhead.org/File/1fb8638d-3e2b-48b1-93d1-5b48ded737ac",
//       categories: [
//         AttractionCategories.Experiences.subcategories.LoveLocalCedarCity,
//       ],
//     },
// ]

export const experiences = functions
    .runWith({ timeoutSeconds: 60, memory: "1GB" })
    .pubsub
    .schedule('every 3 hours').onRun(async context => {  

        functions.logger.info("Hello logs!", {structuredData: true});

        const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
        const page = await browser.newPage();
        await page.goto('https://visitcedarcity.com/blog/#blog-posts')
        await page.waitFor(5000);

        // const Cedar = await page.$("#GridInterstates_ctl00__19");
        // const CedarText = await page.evaluate(element => element.innerHTML, Cedar);

        let returnable = "["
        let id = 98790;

        const elHandleArray = await page.$$('.blog-indiv')

        await elHandleArray.map(async el => {
            const LongValText = await page.evaluate(element => element.innerHTML, el); 
            const data = LongValText.split('"')
            const title = data[8].split("</h2>")[0].slice(23)
            const url = data[1]
            const image = "https://visitcedarcity.com/"+data[5].split("&quot;")[1]


            id++;
            returnable = returnable + "{\"id\": "+id+",\"title\": \""+title+"\",\"subtitle\": \"Experiences\",\"url\": \""+url+"\",\"description\": \"Looking for an idea of what to do in Cedar City?\",\"image\": \""+image+"\",       \"categories\": [] },"
            // LongValText



        })

        await page.goto('https://visitcedarcity.com/')
        await page.waitFor(5000);


        const instHandleArray = await page.$$('.sbi_photo_wrap')

        await instHandleArray.map(async el => {
            const LongValText = await page.evaluate(element => element.innerHTML, el); 
            const data = LongValText.split('"')

            functions.logger.info(data, {structuredData: true});
            const title = "Connect with us"
            const url = data[3]
            const image = data[9]
            let test = data[19].replace(/(\r\n|\n|\r)/gm, "")
            

            if(test === "true" || test === true){
                test = data[41].replace(/(\r\n|\n|\r)/gm, "")
            }

            functions.logger.info(test, {structuredData: true});
            id++;
            returnable = returnable + "{\"id\": "+id+",\"title\": \""+title+"\",\"subtitle\": \"Experiences\",\"url\": \""+url+"\",\"description\": \""+test+"\",\"image\": \""+image+"\",       \"categories\": [] },"
            // LongValText

            // functions.logger.info(returnable, {structuredData: true});
                await admin.firestore().collection('Experiences').doc("current").update({
                    current: returnable,
                })
            

        })
    
    
    
        
        await browser.close();



});

export const foodsanddrinks = functions
    .runWith({ timeoutSeconds: 60, memory: "1GB" })
    .pubsub
    .schedule('every 3 hours').onRun(async context => {  

        functions.logger.info("Hello logs!", {structuredData: true});

        const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
        const page = await browser.newPage();
        await page.goto('https://visitcedarcity.com/food-drink/')
        await page.waitFor(5000);

        // const Cedar = await page.$("#GridInterstates_ctl00__19");
        // const CedarText = await page.evaluate(element => element.innerHTML, Cedar);

        let returnable = "["
        let id = 243098100;

        const elHandleArray = await page.$$('.listing-container')

        await elHandleArray.map(async el => {
            const LongValText = await page.evaluate(element => element.innerHTML, el); 
            if(!LongValText.includes("Fast Food")){
                const data = LongValText.split('"')
                let title = data[8].split("</h4>")[0].slice(5)
                if(title.includes("&amp;"))
                    title = title.replace("&amp;","&")
                const url = data[21]
                const image = data[3].split("&quot;")[1]


                id++;
                returnable = returnable + "{\"id\": "+id+",\"title\": \""+title+"\",\"subtitle\": \"Food and Drinks\",\"url\": \""+url+"\",\"description\": \"Try Cedar City's Food and drink.\",\"image\": \""+image+"\",       \"categories\": [] },"
                // LongValText

                // functions.logger.info(returnable, {structuredData: true});
                if(id>104){
                    await admin.firestore().collection('Foodsanddrinks').doc("current").update({
                        current: returnable,
                    })
                }
            }

        })
    
    
    
        
        await browser.close();



});

export const lodging = functions
    .runWith({ timeoutSeconds: 20, memory: "1GB" })
    .pubsub
    .schedule('every 3 hours').onRun(async context => {  

        // functions.logger.info("Hello logs!", {structuredData: true});

        const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
        const page = await browser.newPage();
        await page.goto('https://visitcedarcity.com/lodging/')
        await page.waitFor(5000);

        // const Cedar = await page.$("#GridInterstates_ctl00__19");
        // const CedarText = await page.evaluate(element => element.innerHTML, Cedar);

        let returnable = "["
        let id = 200;

        const elHandleArray = await page.$$('.listing-container')

        await elHandleArray.map(async el => {
            const LongValText = await page.evaluate(element => element.innerHTML, el); 
            // if(!LongValText.includes("Fast Food")){
                const data = LongValText.split('"')
                let title = data[8].split("</h4>")[0].slice(5)
                if(title.includes("&amp;"))
                    title = title.replace("&amp;","&")
                const url = data[21]
                const image = data[3].split("&quot;")[1]


                id++;
                returnable = returnable + "{\"id\": "+id+",\"title\": \""+title+"\",\"subtitle\": \"Lodging\",\"url\": \""+url+"\",\"description\": \"Best Places to stay in Cedar City.\",\"image\": \""+image+"\",       \"categories\": [] },"
                // LongValText

                functions.logger.info(returnable, {structuredData: true});
                if(id>203){
                    await admin.firestore().collection('Lodgings').doc("current").update({
                        current: returnable,
                    })
                }
            // }

        })
    
    
    
        
        await browser.close();



});