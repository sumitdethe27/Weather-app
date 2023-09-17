const key='a3c54860356681a894fc6fe02a40e324';
const city='Jabalpur'
const url=`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${key}&units=metric`;

let DAYS_OF_WEEK=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

let TimeNow= new Intl.DateTimeFormat('en',{
    hour:"numeric",
    hour12:true
})

let getdata=async ()=>{
    let response= await fetch(url);
    return response.json();
}
let formatTemp=(temp) =>`${temp.toFixed(1)}°`;

let loadcontent=({main:{temp,temp_min,temp_max},name,weather:[{description}]})=>{
    let currentforecast=document.querySelector('#current-forecast')
    currentforecast.querySelector('.city-name').textContent=name;
    currentforecast.querySelector('.temp').textContent=`${formatTemp(temp)}`;
    currentforecast.querySelector('.desc').textContent=description;
    currentforecast.querySelector('.high-low').textContent=`H:${formatTemp(temp_max)}  L:${formatTemp(temp_min)}`;
    
    
    
}
let getHourlydata= async ({name})=>{
    let response=await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${name}&appid=${key}&units=metric`);
    let data= await response.json();
 
    const {list}=data;
    // console.log(data)
    return list.map((item)=>{
        let {main:{temp,temp_min,temp_max},weather:[{icon}],dt_txt}=item;
        // console.log(icon);
        return {temp,dt_txt,icon,temp_max,temp_min};
    });
} 
let geticon= icon =>`https://openweathermap.org/img/wn/${icon}@2x.png`;

let loadhourlydata=async (data)=>{
    console.log(data);
    let hourlysection=document.querySelector('.hourlyforecast');
    let innerContent=``;
    // console.log(data);
    let only=data.slice(0,12);
    let now=true;      
    for (const {dt_txt,icon,temp,temp_max,temp_min} of only) {
        let [,time]=dt_txt.split(' ');
       innerContent+=` <article >
       <h2 class="now">${now===true?"Now":TimeNow.format(new Date(dt_txt))}</h2>
       <img src='${ geticon(icon)}'  class="icon" alt="" >
       <p class="temp">${formatTemp(temp)}</p>
   </article>` 
   now=false;
    }
    hourlysection.innerHTML=innerContent;
}
let loadFeelsLikeAndHumidity=({main:{feels_like,humidity}})=>{
    let container=document.querySelector('.container');
    container.querySelector('.feels-temp').textContent=formatTemp(feels_like);   
    container.querySelector('.humidity-val').textContent=`${humidity} %`;   
}
let getFivedays=(hourlydata)=>{

    let datamap=new Map();
    // console.log(hourlydata);
    for (const forecast of hourlydata) {
    // console.log([forecast]);
    
        let [date]=forecast.dt_txt.split(" ");
        let currentDate=DAYS_OF_WEEK[new Date(date).getDay()];
        // console.log(currentDate);
        if(datamap.has(currentDate)){
            let dayForecast=datamap.get(currentDate);
            dayForecast.push(forecast);
            datamap.set(currentDate,dayForecast)
        }else{
            datamap.set(currentDate,[forecast])
        }
        
    }
        // console.log(datamap);
    for (const [key,val] of datamap) {
        // console.log(val)
        let temp_min=Math.min(...val.map((item)=> item.temp_min))
        let temp_max=Math.max(...val.map((item)=> item.temp_max))
       
       let icon=val.find(item=>item.icon).icon
       
        datamap.set(key,{temp_max,temp_min,icon})
    }
    return datamap;
}
let loadFivedays=(hourlydata)=>{

    let fivedays= getFivedays(hourlydata);
    let container=document.querySelector('.fivedays');
    let content=``;    
    // console.log(fivedays);
    let today=false;
    // console.log(fivedays);
    // console.log(Array.from(fivedays));
    let count=4;
    for (const [key,val] of fivedays) {
        if(count<0)break;
        console.log(val);
        content+=`
        <article class="days">
         <h1 class="fiveday-head">${today===false?"Today":key}</h1>
         <img class="fiveday-icon" src="${geticon(val.icon)}">
         <p class="fiveday-low">${formatTemp(val.temp_min)}</p>
         <p class="fiveday-high"> ${formatTemp(val.temp_max)}</p>
        </article>    
        `
        today=true;
        count-=1;
    }
    // console.log(content);
    container.innerHTML=content;     
    //     <article id="fiveday-forecast">
    //     <h1 >5 day forecast</h1>
    //     <section class="fivedays">
       
    //     </section>
    // </article>
    
}
        document.addEventListener('DOMContentLoaded', async()=>{
            let currentforecast=await getdata();
    loadcontent(currentforecast);
    let hourlydata=await getHourlydata(currentforecast);
    // console.log(hourlydata)
    // console.log(currentforecast)
    loadhourlydata(hourlydata)
    loadFeelsLikeAndHumidity(currentforecast);
    // console.log(hourlydata);
    // fivedayforecast(hourlydata)
    loadFivedays(hourlydata);
    // let {city:{name},list}= await hourlydata;
    // console.log(name)
   
})