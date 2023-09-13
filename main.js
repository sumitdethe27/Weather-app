const key='a3c54860356681a894fc6fe02a40e324';
const city='Jabalpur'
const url=`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${key}&units=metric`;
let data;
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
        return [temp,dt_txt,icon,temp_max,temp_min];
    });
} 
let geticon= icon =>`https://openweathermap.org/img/wn/${icon}@2x.png`;

let loadhourlydata=async (data)=>{
    let hourlysection=document.querySelector('.hourlyforecast');
    let innerContent=``;
    let only=data.slice(0,14)
    for (const [temp,time,icon] of only) {
       innerContent+=` <article >
       <h2 class="now">${time.slice(11,19)}</h2>
       <img src='${await geticon(icon)}'  class="icon" alt="" >
       <p class="temp">${formatTemp(temp)}</p>
   </article>` 
    }
    hourlysection.innerHTML=innerContent;
}
let loadFeelsLikeAndHumidity=({main:{feels_like,humidity}})=>{
    let container=document.querySelector('.container');
    container.querySelector('.feels-temp').textContent=formatTemp(feels_like);   
    container.querySelector('.humidity-val').textContent=`${humidity} %`;   
}
let fivedayforecast=(data)=>{
    // console.log(data);
    let container=document.querySelector('.fivedays');
    let content="";
    let DAYS_OF_WEEK=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
     for (const  [,date,icon,temp_max,temp_min] of data) {
        let day=new Date(date.split(' '));
        console.log(day.toUTCString().slice(0,3));
        content+=` 
        <article class="days">
        <h2 class="fiveday-head">Tuesday</h2>
        <img class="fiveday-icon" src="${geticon(icon)}"/img>
        <p class="fiveday-low">${formatTemp(temp_min)}</p>
        <p class="fiveday-high">${formatTemp(temp_max)}</p>
        </article>`;
        
    }
    container.innerHTML=content
}
document.addEventListener('DOMContentLoaded', async()=>{
    let currentforecast=await getdata();
    loadcontent(currentforecast);
    let hourlydata=await getHourlydata(currentforecast);
    // console.log(hourlydata)
    // console.log(currentforecast)
    loadhourlydata(hourlydata)
    loadFeelsLikeAndHumidity(currentforecast);
    fivedayforecast(hourlydata)
    // let {city:{name},list}= await hourlydata;
    // console.log(name)
   
})