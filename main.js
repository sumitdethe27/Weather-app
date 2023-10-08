const key='a3c54860356681a894fc6fe02a40e324';
// let selectedText=document.querySelector('#search').value;
let DAYS_OF_WEEK=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

let TimeNow= new Intl.DateTimeFormat('en',{
    hour:"numeric",
    hour12:true
})
const updateBackground=(description)=>{
    
        if(description===undefined||null){
            description=document.querySelector('.desc').textContent;
        }
        background.forEach((item)=>{
          if(description.toLowerCase().includes(item)){
              document.body.style.backgroundImage=`url('./img/${item}.jpg')`
              document.body.style.backgroundSize = "cover"; // Ensures the image covers the entire background
              document.body.style.backgroundRepeat = "no-repeat"; // Prevents image repetition
                   
          }
        })  
      }
  
let city='New Delhi'
let lat=null;
let lon=null;

let getdata=async ()=>{
    // console.log("working");
    try{const url=(lat && lon)?`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}&units=metric`:`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${key}&units=metric`;
    let response= await fetch(url);
    console.log(response);
    // console.log("response");
    return response.json();
    }
    catch(e){
        console.log(e.message);
        console.log("cant process");
    }
}
let formatTemp=(temp) =>`${temp.toFixed(1)}°`;
const background=['cloud','haze','mist','rain','sun'];
let loadcontent=({main:{temp,temp_min,temp_max},name,weather:[{description,main}]})=>{
    console.log(main.toLowerCase());
    console.log(description);
    let currentforecast=document.querySelector('#current-forecast')
    currentforecast.querySelector('.city-name').textContent=name;
    currentforecast.querySelector('.temp').textContent=`${formatTemp(temp)}`;
    currentforecast.querySelector('.desc').textContent=description;
    updateBackground(description);
    currentforecast.querySelector('.high-low').textContent=`H: ${formatTemp(temp_max)}        L: ${formatTemp(temp_min)}`;
    // console.log(temp);
    
    
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
   
    let hourlysection=document.querySelector('.hourlyforecast');
    let innerContent=``;
    // console.log(data);
    let only=data.slice(1,11);
    let now=true;      
    for (const {dt_txt,icon,temp,temp_max,temp_min} of only) {
        
       innerContent+=` <article >
       <h2 class="now">${now==true? "Now" :TimeNow.format(new Date(dt_txt))}</h2>
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
        // console.log(val);
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

let loadCityNames=(cities)=>{
    // console.log(cities);
    let optionsList=document.querySelector('#cities')
    let options=``;
    for (const {lat,lon,name,country,state} of cities) {
        options+=`<option id="opt" data-list-value="${lat} ${lon}" value="${name}, ${state} ,${country}">`
    }
    optionsList.innerHTML=options;
    // console.log(optionsList);

}
let getCityName=async (text)=>{
    try{

        let city= await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${text}&limit=7&appid=${key}`)
        let response=await city.json();
        loadCityNames(response );
        updateBackground(description);
    }catch(e){
        console.log("Error in reading the city name"+e.message);
    }
    
    
}
function debounceOnsearch(func,delay){
    let timer;
    //    console.log("working ");

    return function(...args){
        clearTimeout(timer)
        timer=setTimeout(function(){
            func.apply(this,args);
        },delay);
    };
}
let debounced=debounceOnsearch(getCityName,1000);
let onSearch=(event)=>{
    let {value}=event.target
    
    debounced(value);
}
let handleCityChange=(event)=>{
    let {value}=event.target;
    // console.log(value);
    // if(value===city)return;
    console.log(event);
    let w=document.querySelector('#cities');
    let option=w.querySelectorAll('option');
    if(option?.length){
        Array.from(option).find((opt)=>{
            if(opt.value===value){
                [lat,lon]=opt.getAttribute('data-list-value').split(' ');
                // console.log(lat);
                // console.log(lon);
            }
        });
        fetchAndPopulate()
    }
    // console.log(w);
    // console.log(option);
}
async function fetchAndPopulate(txt){
    
     let currentforecast=await getdata(txt);
     loadcontent(currentforecast);
     let hourlydata=await getHourlydata(currentforecast);
 
     loadhourlydata(hourlydata)
 
     loadFeelsLikeAndHumidity(currentforecast);
 
     loadFivedays(hourlydata);
    // console.log(city);
}
const getLocationUsingGeoLocation=()=>{
    navigator.geolocation.getCurrentPosition(({coords})=>{
        if(!(lat && lon)){
            lat=coords.latitude;
            lon=coords.longitude;
            console.log(lat);
            console.log(lon);
              fetchAndPopulate();
        }
        // console.log(latitude);
        // console.log(longitude);
       
        
    },err=>console.log(err))
    console.log(lat);
    console.log(lon);
}
document.addEventListener('DOMContentLoaded', async()=>{
    const search=document.querySelector('#search');
    search.addEventListener('input',function(event){
    //    console.log("working ");
        onSearch(event);
        
    });
    search.addEventListener('change',handleCityChange);

    fetchAndPopulate();   
//    getLocationUsingGeoLocation();
})