import axios from "axios"
import puppeteer from 'puppeteer'
import fs from 'fs'

const getCookies = async() => {
  try{
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://www.traveloka.com');
    const cookies = await page.cookies()
    await browser.close()
    return cookies    
  }catch(error){
    throw `Error at Getting Cookies : ${error}`
  }
}

const getSummary = async (cookies, departyear,departmonth,departday,origin,destination,trainNumber) =>{

  const options = {
    method: 'POST',
    url: 'https://www.traveloka.com/api/v2/train/search/inventoryv2',
    headers: {
      cookie: 'tvs=qgdHX7GvehrD9XH5a3S4PXluxEriqG7u5C8FPWG91JekD8zelA2L6VPkBeALmdVOD/PrpLykJGEGQa8faLxupaQESo7l71zcwcARlJNVrSE=; tvl=qgdHX7GvehrD9XH5a3S4PZ6atohJjMcK4L5/Gd9p9+HSK27uZ/XOmAEXKPNz7xlLi7ceDGYgYneH+AfodZMd5A==a',
      // `tvs=${cookies.filter((el)=>el.name === 'tvs')[0].value}; tvl=${cookies.filter((el)=>el.name === 'tvl')[0].value}`,
      authority: 'www.traveloka.com',
      accept: '*/*',
      'accept-language': 'en-US,en;q=0.9',
      'content-type': 'application/json',
      origin: 'https://www.traveloka.com',
      'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="100", "Google Chrome";v="100"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36',
      'x-domain': 'train',
      'x-route-prefix': 'en-id'
    },
    data: {
      fields: [],
      data: {
        departureDate: {day: departday, month: departmonth, year: departyear},
        returnDate: null,
        destination: destination,
        origin: origin,
        numOfAdult: 1,
        numOfInfant: 0,
        providerType: 'KAI',
        currency: 'IDR',
        trackingMap: {utmId: null, utmEntryTimeMillis: 0}
      },
      clientInterface: 'desktop'
    }
  };

  try{
    let response = await axios.request(options)

    let temp = response.data.data.departTrainInventories
  
    let selected = temp.filter((el) => {
      return el.trainSegments[0]['productSummary']['trainNumber'] === trainNumber
    })
  
    return selected[0]['trainSegments'][0]['productSummary']     
  } catch (error){
    throw `Error at Getting Summary ${error}`
  }
}

const getSeat = async (cookies, productSummary) =>{
  
  const options = {
    method: 'POST',
    url: 'https://www.traveloka.com/api/v2/train/seatmap/infov2',
    headers: {
      cookie: 'tvs=qgdHX7GvehrD9XH5a3S4PXluxEriqG7u5C8FPWG91JekD8zelA2L6VPkBeALmdVOD/PrpLykJGEGQa8faLxupaQESo7l71zcwcARlJNVrSE=; tvl=qgdHX7GvehrD9XH5a3S4PZ6atohJjMcK4L5/Gd9p9+HSK27uZ/XOmAEXKPNz7xlLi7ceDGYgYneH+AfodZMd5A==a',
      authority: 'www.traveloka.com',
      accept: '*/*',
      'accept-language': 'en-US,en;q=0.9',
      'content-type': 'application/json',
      origin: 'https://www.traveloka.com',
      referer: 'https://www.traveloka.com/en-id/booking/v2/lcx-17ed905e-6852-4562-b02c-a3b9f0e5ea99',
      'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="100", "Google Chrome";v="100"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36',
      'x-domain': 'train',
      'x-route-prefix': 'en-id'
    },
    data: {
      fields: [],
      data: {
        trainProductSummary:productSummary
      },
      clientInterface: 'desktop'
    }
  };

  try{
    
    let seatmap = await axios.request(options)

    return seatmap.data 
  }catch(error){
    throw `Error at Getting Seat : ${error}`
  }
}

const Main = async (departyear,departmonth,departday,origin,destination,trainNumber) => {
  try{
    // let cookies = await getCookies()

    let productSummary = await getSummary('', departyear,departmonth,departday,origin,destination,trainNumber)
  
    let seatMap = await getSeat('', productSummary)
  
    return seatMap    
  } catch(error){
    throw `Error at Main : ${error}`
  }
}

const getSeatMap = async(departyear,departmonth,departday,origin,destination,trainNumber) => {
  try{
    let e = await Main(departyear,departmonth,departday,origin,destination,trainNumber)
    let test = e['data']['wagons'].filter((el)=>{
      return el['seating'].some((el2)=>{
        return el2.some((el3)=>{
          return el3['status'] === 'AVAILABLE'
        })
      })
    })
  
    let arr = []
    test.forEach((el)=>{
      let obj = {}
      let kursi_avail = []
      obj['gerbong'] = el['wagonId']
      let arr2 = []
      el['seating'].forEach((el2, index)=>{
        let seatmaplabel = el2.filter((x)=>x.type === 'SEAT_MAP_LABEL')[0]['value']
        if(index !== 0){
          let jos = el2.map((el4, index)=>{
            if(el4['status'] === 'AVAILABLE'){
              return el['wagonId'] + " - " + seatmaplabel +el['seating'][0][index]['value']
            } else {
              return ''
            }
          })
          arr2.push(jos)
        }
      })
      arr.push(arr2)
    })
  
    return arr 
  }catch(error){
    throw `Error at Get Seating Map : ${error}`
  }
}

const getJejer = async(departyear,departmonth,departday,origin,destination,trainNumber,numofjejer) => {
  let seatmap = await getSeatMap(departyear,departmonth,departday,origin,destination,trainNumber)

  if(numofjejer == 2){
    seatmap.filter((el)=>{
      return 
    })
  } else if (numofjejer > 2){
    let jos = seatmap.filter((el)=>{
      return el.reduce((accum,x)=>{
        if(x !== ''){
          return accum + 1
        }
        return accum
      },0) == numofjejer
    })

    return jos
  } else {
    return seatmap
  }
}

export default getJejer

// getJejer('2022','4','16','SMC','WLR','205',0).then((e)=>console.log(e)).catch((e)=>console.log(e))
