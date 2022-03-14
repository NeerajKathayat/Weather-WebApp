const config={
    cUrl:"https://api.countrystatecity.in/v1/countries",
    cKey:"RDhaYmpVTnpLQjRQM1UzbkRzWE42ZnNYa1RhY2FDcWdkOE9KZ2xGTg==",
    wUrl:"https://api.openweathermap.org/data/2.5/",
    wKey:"2c9a510a18896ed992d24759e845d8b4",
};

//get countries
//get states
//get cities

const getCountries=async (fieldName,...args)=>{          //...args is a rest operator
    let apiEndPoint ;
    //https://api.countrystatecity.in/v1/countries/[ciso]/states/[siso]/cities
    switch(fieldName){   
        case 'countries':
             apiEndPoint =config.cUrl;
            break;
        case 'states':
            apiEndPoint =`${config.cUrl}/${args[0]}/states`;
            console.log(args)
            break;
        case 'cities':
            apiEndPoint =`${config.cUrl}/${args[0]}/states/${args[1]}/cities`;
            default:
    }
   const response=await fetch(apiEndPoint,{headers:{"X-CSCAPI-KEY": config.cKey}});
   if(response.status!=200){
       throw new Error(`Something went wrong, status code: ${response.status}`)
   }
   const countries=await response.json();
   return countries;

};



//get weather info
const getWeather=async (cityName,ccode,units="metric")=>{
    const apiEndPoint=`${config.wUrl}weather?q=${cityName},${ccode.toLowerCase()}&APPID=${config.wKey}&units=${units}`;
  
  try{
    const response=await fetch(apiEndPoint);
    if(response.status!=200){
        if(response.status==404){
            weatherDiv.innerHTML=`<div class="alert-danger"><h3>Oops! No data available.</h3></div>`
        }else{
        throw new Error(`Something went wrong, status code:${response.status}`)
        }
    }
 
    const weather=await response.json();
    return weather;
  }catch(error){
      console.log(error);
      
  }
}



//getting  timestamp date from weather api

const getDateTime = (unixTimeStamp) => {
    const milliSeconds = unixTimeStamp * 1000;
    const dateObject = new Date(milliSeconds);
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const humanDateFormate = dateObject.toLocaleDateString("en-US", options);
    console.log(humanDateFormate)
    return humanDateFormate;
  };


///calling tempCard
  const tempCard =(val,unit="cel")=>{
      const flag= unit=="far" ? "°F" : "°C";
      return ` <div id="tempcard">
      <h6 class="card-subtitle mb2 ${unit}">${val.temp}</h6>
      <p class="card-text">Feels Like: ${val.temp} ${flag}</p>
      <p class="card-text">Max: ${val.temp_max} ${flag}, Min: ${val.temp_min} ${flag}</p>
  </div>`
  }



  //displaying weather data

const displayWeather=(data)=>{
    const weatherWidget=` <div class="card">
    <div class="card-body">
        <h5 class="card-title">
            ${data.name}, ${data.sys.country} 
            <span class="float-end units"><a href="#" class="unitlink active" data-unit="cel">°C</a> | <a href="#" class="unitlink" data-unit="far">°F</a></span>
        </h5>
          <p>${getDateTime(data.dt)}</p>
        <div id="tempcard">${tempCard(data.main)}
        </div>
        <div id="img-container">${data.weather[0].main} <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}.png" alt="" srcset=""></div>
        <p>${data.weather[0].description}</p>
    </div>
</div>`;
   weatherDiv.innerHTML=weatherWidget;
};


//playing loader
const getLoader=()=>{
    return `<div class="spinner-grow text-info" role="status">
    <span class="visually-hidden">Loading...</span>
  </div>`;
}


const countriesListDropDown=document.querySelector("#countrylist");
const stateListDropDown=document.querySelector("#statelist");
const cityListDropDown=document.querySelector("#citylist")
const weatherDiv=document.querySelector("#weatherwidget")



//listing all Countries

document.addEventListener('DOMContentLoaded',async ()=>{
    const countries=await getCountries('countries')
    console.log(countries)
    let countriesOptions='';
    if(countries){
        countriesOptions +=`<option value="">Select Country</option>`;
        countries.forEach(country=>{
            countriesOptions +=`<option value="${country.iso2}">${country.name}</option>`;

        });
        countriesListDropDown.innerHTML=countriesOptions

    }

    //listing all states

    countriesListDropDown.addEventListener('change',async function(){
        const selectedCountryCode=this.value;
        const states=await getCountries('states',selectedCountryCode)
        console.log(states)
        let statesOptions='';
        if(states){
            statesOptions +=`<option value="">Select state</option>`;
            states.forEach(states=>{
                statesOptions +=`<option value="${states.iso2}">${states.name}</option>`;
    
            });
            stateListDropDown.innerHTML=statesOptions
            stateListDropDown.disabled=false
    
        }
    })
    
    //listing all cities

    stateListDropDown.addEventListener('change',async function(){  //here we can't use arrow function because we are using this kwyword and arrow function dosen't support this keyword
        const selectedCountryCode=countriesListDropDown.value;
        const selectedStateCode=this.value;
         console.log("dff ",selectedStateCode)
        const cities=await getCountries('cities',selectedCountryCode,selectedStateCode)
        console.log(cities)
        let citiesOptions='';
        if(cities){
            citiesOptions +=`<option value="">Select city</option>`;
            cities.forEach(city=>{
                citiesOptions +=`<option value="${city.name}">${city.name}</option>`;
               
            });
            cityListDropDown.innerHTML=citiesOptions;
            cityListDropDown.disabled=false;
        }

    })


  //selecting  city

    cityListDropDown.addEventListener('change', async function(){
        const selectedCountryCode=countriesListDropDown.value;
        const selectedCity=this.value;
        weatherDiv.innerHTML=getLoader();
      const weatherInfo=await getWeather(selectedCity,selectedCountryCode)
     displayWeather(weatherInfo);
    })
    
    //change unit

    document.addEventListener('click',async (e)=>{
       if(e.target.classList.contains("unitlink")){
          const unitValue = e.target.getAttribute("data-unit");
          const selectedCountryCode=countriesListDropDown.value;
          const selectedCity=cityListDropDown.value;

         const unitFlag=unitValue=="far"?"imperial":"metric";
          const weatherInfo=await getWeather(selectedCity,selectedCountryCode,unitFlag);
        const weatherTemp=tempCard(weatherInfo.main,unitValue)
         document.querySelector("#tempcard").innerHTML=weatherTemp;

         document.querySelectorAll(".unitlink").forEach((link)=>{
            link.classList.remove('active')
        })
        e.target.classList.add('active')
       }
    })
});


