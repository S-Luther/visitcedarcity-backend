// @ts-nocheck
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as puppeteer from 'puppeteer';
import fetch from 'node-fetch';

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
    .schedule('every 4 hours').onRun(async context => {  
    
        functions.logger.info("Hello logs!", {structuredData: true});


            const url = 'https://www.brianhead.com';
            const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
            const page = await browser.newPage();
            await page.goto(url);
            await page.waitForTimeout(5000);
            let baseDepthText, onedaySnowfallText, liftsOpenText, trailsOpenText, tempText, conditionsText, windText

            let inseason = false

            try {
                const baseDepth = await page.$(".w153_acf_option_bh_snr_snow_basedepth");
                baseDepthText = await page.evaluate(element => element.textContent, baseDepth);
                functions.logger.info("Base Depth: "+baseDepthText, {structuredData: true});
    
                const onedaySnowfall = await page.$(".w1-number.w153_acf_option_bh_snr_snow_24hour");
                onedaySnowfallText = await page.evaluate(element => element.textContent, onedaySnowfall);
                functions.logger.info("24hr Snowfall: "+onedaySnowfallText, {structuredData: true});
    
                const liftsOpen = await page.$(".w1-number.w153_acf_option_bh_snr_lifts_open");
                liftsOpenText = await page.evaluate(element => element.textContent, liftsOpen);
                functions.logger.info("Lifts Open: "+liftsOpenText, {structuredData: true});
    
                const trailsOpen = await page.$(".w1-number.w153_acf_option_bh_snr_trails_open");
                trailsOpenText = await page.evaluate(element => element.textContent, trailsOpen);
                functions.logger.info("Trails Open: "+trailsOpenText, {structuredData: true});
    
                const temp = await page.$(".w153_pl_bh_option_weather_temperature");
                tempText = await page.evaluate(element => element.textContent, temp);
                functions.logger.info("Brian Head Temp: "+tempText, {structuredData: true});
    
                const conditions = await page.$(".w153_pl_bh_option_weather_shortForecast");
                conditionsText = await page.evaluate(element => element.textContent, conditions);
                functions.logger.info("Brian Head Conditions: "+conditionsText, {structuredData: true});
    
                const wind = await page.$(".w1-line2.w153_pl_bh_option_weather_wind");
                windText = await page.evaluate(element => element.textContent, wind);
                functions.logger.info("Brian Head Wind: "+windText, {structuredData: true});
                inseason = true
            } catch (error) {
                baseDepthText = "NaN";
                functions.logger.info("Base Depth: "+baseDepthText, {structuredData: true});
    
                onedaySnowfallText = "NaN"
                functions.logger.info("24hr Snowfall: "+onedaySnowfallText, {structuredData: true});
    
                const liftsOpen = await page.$(".w1-number.w153_acf_option_bh_snr_lifts_open");
                liftsOpenText = await page.evaluate(element => element.textContent, liftsOpen);
                functions.logger.info("Lifts Open: "+liftsOpenText, {structuredData: true});
    
                const trailsOpen = await page.$(".w1-number.w153_acf_option_bh_snr_trails_open");
                trailsOpenText = await page.evaluate(element => element.textContent, trailsOpen);
                functions.logger.info("Trails Open: "+trailsOpenText, {structuredData: true});
    
                const temp = await page.$(".w153_pl_bh_option_weather_temperature");
                tempText = await page.evaluate(element => element.textContent, temp);
                functions.logger.info("Brian Head Temp: "+tempText, {structuredData: true});
    
                const conditions = await page.$(".w153_pl_bh_option_weather_shortForecast");
                conditionsText = await page.evaluate(element => element.textContent, conditions);
                functions.logger.info("Brian Head Conditions: "+conditionsText, {structuredData: true});
    
                const wind = await page.$(".w1-line2.w153_pl_bh_option_weather_wind");
                windText = await page.evaluate(element => element.textContent, wind);
                functions.logger.info("Brian Head Wind: "+windText, {structuredData: true});
                inseason = false

            }

            if(inseason){
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
            }

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
    await page.waitForTimeout(5000);


    const temp = await page.$(".city-temp");
    const tempText = await page.evaluate(element => element.textContent, temp);
    functions.logger.info("Temp: "+tempText, {structuredData: true});

    const conditions = await page.$(".city-icon");
    const conditionsText = await page.evaluate(element => element.src, conditions);
    functions.logger.info("Conditions: "+conditionsText, {structuredData: true});


    // await admin.firestore().collection(name+'WeatherDayData').add({
    //     Date: new Date(),
    //     temp: tempText,
    //     conditions: conditionsText,
    // })

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
    .schedule('every 30 minutes').onRun(async context => {  
    
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
        await page.waitForTimeout(5000);

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
    .schedule('every 10 minutes').onRun(async context => {  

        functions.logger.info("Hello logs!", {structuredData: true});

        const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
        const page = await browser.newPage();
        await page.goto('https://visitcedarcity.com/blog/#blog-posts')
        await page.waitForTimeout(5000);

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
            await admin.firestore().collection('Experiences').doc("current").update({
                current: returnable,
            })


        })

        // await page.goto('https://visitcedarcity.com/')
        // await page.waitForTimeout(5000);


        // const instHandleArray = await page.$$('.sbi_photo_wrap')

        // await instHandleArray.map(async el => {
        //     const LongValText = await page.evaluate(element => element.innerHTML, el); 
        //     const data = LongValText.split('"')

        //     functions.logger.info(data, {structuredData: true});
        //     const title = "Connect with us"
        //     const url = data[3]
        //     const image = data[9]
        //     let test = "Connect with us on social media and see more of what you can experience in Cedar City!"
            

        //     functions.logger.info(test, {structuredData: true});
        //     id++;
        //     returnable = returnable + "{\"id\": "+id+",\"title\": \""+title+"\",\"subtitle\": \"Experiences\",\"url\": \""+url+"\",\"description\": \""+test+"\",\"image\": \""+image+"\",       \"categories\": [] },"
        //     // LongValText

        //     // functions.logger.info(returnable, {structuredData: true});
        //         await admin.firestore().collection('Experiences').doc("current").update({
        //             current: returnable,
        //         })
            

        // })
    
    
    
        
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
        await page.waitForTimeout(5000);

        // const Cedar = await page.$("#GridInterstates_ctl00__19");
        // const CedarText = await page.evaluate(element => element.innerHTML, Cedar);

        let returnable = "["
        let id = 243098100;

        const elHandleArray = await page.$$('.listing-container')

        await elHandleArray.map(async el => {
            const LongValText = await page.evaluate(element => element.innerHTML, el); 
            if(!LongValText.includes("Fast Food")){
                const data = LongValText.split('"')
                const address = data[9];
                let title = data[8].split("</h4>")[0].slice(5)
                if(title.includes("&amp;"))
                    title = title.replace("&amp;","&")
                const url = data[21]
                const image = data[3].split("&quot;")[1]
                


                id++;
                returnable = returnable + "{\"id\": "+id+",\"title\": \""+title+"\",\"subtitle\": \"Food and Drinks\",\"url\": \""+url+"\",\"description\": \"Try Cedar City's Food and drink.\",\"image\": \""+image+"\", \"address\": \""+address+"\",      \"categories\": [] },"
                // LongValText

                // functions.logger.info(returnable, {structuredData: true});
                if(id>243098104){
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
        await page.waitForTimeout(5000);

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
                const address = data[9];

                if(title.includes("&amp;"))
                    title = title.replace("&amp;","&")
                const url = data[21]
                const image = data[3].split("&quot;")[1]


                id++;
                returnable = returnable + "{\"id\": "+id+",\"title\": \""+title+"\",\"subtitle\": \"Lodging\",\"url\": \""+url+"\",\"description\": \"Best Places to stay in Cedar City.\",\"image\": \""+image+"\", \"address\": \""+address+"\",      \"categories\": [] },"
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

async function getCCSched(){
    let returnable = "{\"schedule\": ["
        var id = 1000;
        const thefetch = await fetch('https://visitcedarcity.com/wp-json/solid/v1/events?per_page=50&page=1', {
            method: 'GET',
            headers: {
              Accept: 'application/json',
            },
        })
        .then(response => response.json())
        .then(async data => {
            // console.log(data.toString().includes("Art Festival"))
            // console.log(data)
            const date = new Date()
            date.setDate(date.getDate() - 1);

            data.events.event.forEach((element: any) => {
                
                if(!(new Date(element.startdate).getTime()<date.getTime())){
                    // console.log(element)
                    id++;
                    returnable = returnable + "{"
                    returnable = returnable + "\"date\": \""+new Date(element.startdate).toISOString().slice(0, 10)+"\","
                
                    returnable = returnable + "\"groups\": [{ \"time\": \"" + new Date(element.startdate).toLocaleTimeString("en-US")+"\","
                    let name = element.title
                    if(name.includes('"')){
                        name = "Check out this event on our Online Calendar"
                        // name.replaceAll("\"","")
                        // console.log(name)

                    }

                    var punctuationless = name.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
                    var finalString = punctuationless.replace(/\s{2,}/g," ");
                    var urlString = finalString.split(' ').join('-');

                    returnable = returnable + "\"sessions\": [ {\"name\": \""+name+"\","
                
                    returnable = returnable + "\"url\": \"https://visitcedarcity.com/events/"+urlString+"/\",\"timeStart\": \""+element.starttime+"\","
                
                    returnable = returnable + "\"timeEnd\": \""+element.endtime+"\","
                    returnable = returnable + "\"location\": \""+element.location+"\","
                
                    returnable = returnable + "\"tracks\": [\"General Events\"],\"id\": \""+id+"\"}]}]},"
                }
            });
            returnable = returnable
            await admin.firestore().collection('Schedules').doc("CC").update({
                Date: new Date(),
                current: returnable,
            })
            return returnable;
        })
}
async function getBHSched(){
    let returnable = "{\"schedule\": ["
        var id = 2000;
        let thefetch = await fetch('https://tockify.com/api/ngevent?max=-1&view=upcoming&calname=brianheadeventsmonthly&max-events-after=12&showAll=false&debug=loaded&passback=2022%3A3%3A0&startms='+new Date().getTime()+'&start-inclusive=true&end-inclusive=true&endms=9651384800000', {
            method: 'GET',
            headers: {
              Accept: 'application/json',
            },
        })
        .then(response => response.json())
        .then(async data => {
            // console.log(data.toString().includes("Art Festival"))
            // console.log(data)
            data.events.forEach((el: any) => {

                let name = el.content.summary.text
                if(name.includes('"')){
                    name = "Check out this event on our Online Calendar"
                    // name.replaceAll("\"","")
                    // console.log(name)

                }
                
                id++;
                returnable = returnable + "{"
                returnable = returnable + "\"date\": \""+new Date(el.when.start.millis).toISOString().slice(0, 10)+"\","
            
                returnable = returnable + "\"groups\": [{ \"time\": \"" + new Date(el.when.start.millis).toLocaleTimeString("en-US")+"\","
            
                returnable = returnable + "\"sessions\": [ {\"name\": \""+name+"\","
            
                returnable = returnable + "\"url\": \"https://brianhead.com\",\"timeStart\": \""+new Date(el.when.start.millis).toLocaleTimeString("en-US")+"\","
            
                returnable = returnable + "\"timeEnd\": \""+new Date(el.when.end.millis).toLocaleTimeString("en-US")+"\","
                returnable = returnable + "\"location\": \""+(JSON.stringify(el.content.location) ? el.content.location.name : "Brian Head Resort")+"\","
            
                returnable = returnable + "\"tracks\": [\"Brian Head\"],\"id\": \""+id+"\"}]}]},"
            });
            returnable = returnable
            await admin.firestore().collection('Schedules').doc("BH").update({
                Date: new Date(),
                current: returnable,
            })
            return returnable;
    });
}

async function getSUMASched(){
    let returnable = "{\"schedule\": ["
    var id = 2000;
    let thefetch = await fetch('https://www.googleapis.com/calendar/v3/calendars/suu.edu_hohm4a339kc7qpj79jnhfom0pc@group.calendar.google.com/events?key=AIzaSyBLJiGeQHA3cHNh0UGWNqJiotLKQOId6J0&timeMin='+new Date().toISOString().slice(0, -5)+'-06:00&maxResults=30&orderBy=startTime&singleEvents=true&q=', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
    })
    .then(response => response.json())
    .then(async data => {
        // console.log(data.toString().includes("Art Festival"))
        // console.log(data)
        data.items.forEach((el: any) => {
            // console.log(el)
            // let newdate = el.start.dateTime.slice(0, -6)+".000Z"
            // console.log(newdate)
            
            id++;

            returnable = returnable + "{"
            try {
                new Date(el.start.dateTime)
                returnable = returnable + "\"date\": \""+new Date(el.start.dateTime).toISOString().slice(0, 10)+"\","
        
                returnable = returnable + "\"groups\": [{ \"time\": \"" + new Date(el.start.dateTime).toLocaleTimeString("en-US")+"\","
            
                returnable = returnable + "\"sessions\": [ {\"name\": \""+el.summary+"\","
            
                returnable = returnable + "\"url\": \"https://www.suu.edu/suma/events.html\",\"timeStart\": \""+new Date(el.start.dateTime).toLocaleTimeString("en-US")+"\","
            
                returnable = returnable + "\"timeEnd\": \""+new Date(el.end.dateTime).toLocaleTimeString("en-US")+"\","
            } catch (error) {
                returnable = returnable + "\"date\": \""+new Date(el.start.date).toISOString().slice(0, 10)+"\","
        
                returnable = returnable + "\"groups\": [{ \"time\": \"" + new Date(el.start.date).toLocaleTimeString("en-US")+"\","
            
                returnable = returnable + "\"sessions\": [ {\"name\": \""+el.summary+"\","
            
                returnable = returnable + "\"url\": \"https://www.suu.edu/suma/events.html\",\"timeStart\": \""+new Date(el.start.date).toLocaleTimeString("en-US")+"\","
            
                returnable = returnable + "\"timeEnd\": \""+new Date(el.end.date).toLocaleTimeString("en-US")+"\","
            }
            returnable = returnable + "\"location\": \""+"SUMA"+"\","
        
            returnable = returnable + "\"tracks\": [\"SUMA\"],\"id\": \""+id+"\"}]}]},"
            // localStorage.setItem("SUMAScheduleUpdate", returnable)
        });
        returnable = returnable
        await admin.firestore().collection('Schedules').doc("SUMA").update({
            Date: new Date(),
            current: returnable,
        })
        return returnable;

    
});
}

async function getCBSched() {
    let returnable = "{\"schedule\": ["
        var id = 3000;
        let thefetch = await fetch('https://www.nps.gov/cebr/nps-alerts-cebr.json?dt='+new Date().getTime(), {
            method: 'GET',
            headers: {
              Accept: 'application/json',
            },
        })
        .then(response => response.json())
        .then(async data => {
            // console.log(data.toString().includes("Art Festival"))
            // console.log(data)
            data.CEDATA.forEach((el: any) => {
                // console.log(el)
                // let newdate = el.start.dateTime.slice(0, -6)+".000Z"
                // console.log(newdate)
                
                id++;

                returnable = returnable + "{"

                    returnable = returnable + "\"date\": \""+new Date().toISOString().slice(0, 10)+"\","
            
                    returnable = returnable + "\"groups\": [{ \"time\": \"\","
                
                    returnable = returnable + "\"sessions\": [ {\"name\": \""+el.FIC_title+"\","
                
                    returnable = returnable + "\"url\": \"https://www.nps.gov/cebr/\",\"timeStart\": \"\","
                
                    returnable = returnable + "\"timeEnd\": \"\","
                returnable = returnable + "\"location\": \""+"Cedar Breaks National Monument"+"\","
            
                returnable = returnable + "\"tracks\": [\"Cedar Breaks National Monument\"],\"id\": \""+id+"\"}]}]},"
                // localStorage.setItem("CBAlertUpdate", returnable)
            });
            returnable = returnable
            await admin.firestore().collection('Schedules').doc("CB").update({
                Date: new Date(),
                current: returnable,
            })
            return returnable;

        
    });
}

async function getSUUPSched(){
    let returnable = "{\"schedule\": ["
        var id = 3000;
        let thefetch = await fetch('https://clients6.google.com/calendar/v3/calendars/c_og7r6jfj5to87olvbqc3he6v18@group.calendar.google.com/events?calendarId=c_og7r6jfj5to87olvbqc3he6v18%40group.calendar.google.com&singleEvents=true&timeZone=America%2FDenver&maxAttendees=1&maxResults=250&sanitizeHtml=true&timeMin=2022-09-25T00%3A00%3A00-06%3A00&timeMax=2032-11-06T00%3A00%3A00-06%3A00&key=AIzaSyBNlYH01_9Hc5S1J9vuFmu2nUqBZJNAXxs', {
            method: 'GET',
            headers: {
              Accept: 'application/json',
            },
        })
        .then(response => response.json())
        .then(async data => {
            // console.log(data.toString().includes("Art Festival"))
            // console.log(data)
            data.items.forEach((el: any) => {
                // console.log(el)
                // let newdate = el.start.dateTime.slice(0, -6)+".000Z"
                //console.log(el.summary, new Date(el.start.dateTime.slice(0, -15)).toISOString().slice(0, 10))
                
                id++;

                returnable = returnable + "{"

                    returnable = returnable + "\"date\": \""+new Date(el.start.dateTime.slice(0, -15)).toISOString().slice(0, 10)+"\","
            
                    returnable = returnable + "\"groups\": [{ \"time\": \"" + new Date(el.start.dateTime).toLocaleTimeString("en-US")+"\","
                
                    returnable = returnable + "\"sessions\": [ {\"name\": \""+el.summary+"\","
                
                    returnable = returnable + "\"url\": \"https://www.suu.edu/pva/\",\"timeStart\": \""+new Date(el.start.dateTime).toLocaleTimeString("en-US")+"\","
                
                    returnable = returnable + "\"timeEnd\": \""+new Date(el.end.dateTime).toLocaleTimeString("en-US")+"\","
                returnable = returnable + "\"location\": \""+el.location+"\","
            
                returnable = returnable + "\"tracks\": [\"SUU Performing Arts\"],\"id\": \""+id+"\"}]}]},"
                // localStorage.setItem("SUUPUpdate", returnable)
            });
            returnable = returnable
            await admin.firestore().collection('Schedules').doc("SUUP").update({
                Date: new Date(),
                current: returnable,
            })
            return returnable;
            

    });
}


export const ScheduleUpdates = functions
    .runWith({ timeoutSeconds: 60, memory: "1GB" })
    .pubsub
    .schedule('every 30 minutes').onRun(async context => {  
    
        functions.logger.info("Hello logs!", {structuredData: true});


        let CC = await getCCSched();
        let BH = await getBHSched();
        let CB = await getCBSched();
        let SUMA = await getSUMASched();
        let SUUP = await getSUUPSched();

        // await admin.firestore().collection('Schedules').doc("current").update({
        //     Date: new Date(),

        // })
     

    });