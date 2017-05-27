const mainURL = 'https://spdspringcamp.herokuapp.com';
const limitAnnouncements = '/announcements?limit=12&';
const link = `${mainURL}${limitAnnouncements}`;
const roomsInp = $('.rooms_select');
const livingRoomInp = $('.liv_rooms_select');
const countryList = $('.input.countries');
const galeryList = $('.galery');
const cityList = $('.input.city');
const priceFrom = $('.price_input_from');
const priceTo = $('.price_input_to');
const galleryItems = [];
const countriesArr = [];
const citiesArr = [];
const showButton = $('.btn-default');
const maxLimitOnPage = 12;
const amountStars = ['bad', 'notbad', 'so-so', 'good', 'gorgeous'];

$(document).ready(() => {
    $(".header__btn").on("click", () => {
        const id  = $(".header__btn").attr('href');
        const destination = $(id).offset().top;
        $('body').animate({scrollTop: destination}, 1000);
    });
});

livingRoomInp.attr('max', roomsInp[0].valueAsNumber);
priceFrom.attr('max', priceTo[0].valueAsNumber);

roomsInp.on('change', event => {
    livingRoomInp.attr('max', event.target.value);
    if (livingRoomInp[0].valueAsNumber > event.target.value) {
        livingRoomInp[0].valueAsNumber = event.target.value;
        linkProperties.livingRooms = event.target.value;
    }
});

priceFrom.on('change', () => {
    if (priceTo[0].value && parseInt(priceFrom[0].value) >= parseInt(priceTo[0].value)) {
        let num = 0;
        num += parseInt(priceFrom[0].value);
        priceTo[0].value = num;
        linkProperties.priceMax = num.toString();
    }
});

priceTo.on('change', () => {
    if(priceFrom[0].value && parseInt(priceTo[0].value) <= parseInt(priceFrom[0].value)) {
        priceTo[0].value = parseInt(priceFrom[0].value, 10);
        linkProperties.priceMin = priceFrom[0].value;
    }
});


countryList.on('change', event => {
    let idCountry = event.target.value;
    cityList.empty();
    citiesArr.length = 0;
    linkProperties.city = "";
    if (countryList[0].value === "") {
        cityList[0].disabled = true; 
        linkProperties.city = "";
    } else { cityList[0].disabled = false; } 
    
    if(idCountry !== "") {
        const citiesNames = getData(`${mainURL}/countries/${idCountry}`);
        citiesArr.push(addEmptyOption);
        citiesNames
            .then(cities => {
                cities.forEach(city =>
                    citiesArr.push(addCityToList(city)));
                citiesArr.forEach(item => cityList.append(item));
                cityList[0].value = '';
            }).catch(error => console.error(error));
    }
});

showButton.on('click', () => {
    galleryItems.length = 0;
    const newLink = addPropertiesInLink(link); 
    let showMore = getData(newLink);
    const id  = $(".ajax_btn").attr('class');
    const destination = $(".btn-default").offset().top;
    $('body').animate({scrollTop: destination - 70}, 1000);

    showMore
        .then(items => {
            if (items.total > linkProperties.offset) {

                linkProperties.offset = parseInt(linkProperties.offset, 10) + (items.total - (items.total - maxLimitOnPage));
                items.total < linkProperties.offset ? showButton.hide() : showButton.show();
            } else {
                showButton.hide();
            }
            items.docs.forEach(item => 
                galleryItems.push(addGaleryItem(item)));
            galleryItems.forEach(item => galeryList.append(item));
        }).catch(error => console.error(error));
});

const addGaleryItem = config => {
    return `
        <div class="galery_item">
            <div class="galery_item-image">
                <img src=${config.image}>
            </div>
            <div class="galery_item-describe">
                <ul class="border">
                    <li>${config.name}</li>
                    <li>city: ${config.city.name}</li>
                    <li>country: ${config.country.name}</li>
                    <li>rooms: ${config.rooms}</li>
                    <li>livingRooms: ${config.rooms}</li>
                    <li>price: ${config.price}</li>
                </ul>
                <div class="rate pull-left">
                    ${addRating(config.rating)}
                </div>
                <a href="#" class="btn_describe">View</a>
            </div>
        </div>
    `
};

const addRating = rating => {
    let nameClass;
    let starsWithRating = '';
    amountStars.forEach((item, i) => {
        nameClass = rating >= i + 1 ? 'rateChecked' : 'rateNotChecked';
        starsWithRating += returnStar(item, nameClass);
    });

    return starsWithRating;
}

const returnStar = (title, nameClass) => {
    return `
        <label title="${title}" class="${nameClass}""></label>
    `
}

const addCountryToList = country => {
    return`
        <option value='${country._id}'>${country.name}</option>
    `
}

const addCityToList = city => {
    return `
        <option value='${city._id}'>${city.name}</option>
    `
}

const addEmptyOption = () => {
    return "<option value=''></option>"
}

const addPropertiesInLink = (link) => {
    let newLink = link;
    for (let val in linkProperties) {
        newLink += val + "=" + linkProperties[val] + "&";
    }
    return newLink;
}

const errEmptyGalery = () => {
    return"<div class='noResults'><h2>No results</h2></div>"
}

function getData(url) {
    return new Promise(function(resolve, reject) {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.onload = function() {
            if (xhr.status === 200) {
                let json = JSON.parse(xhr.response);
                resolve(json);
            } else {
                reject(xhr.statusText);
            }
        };
        
        xhr.onerror = function(error) {
            reject(error);
        };

        xhr.send();
    });
}

const countriesNames = getData(`${mainURL}/countries`);
const itemsNames = getData(link);

//URL--------------------------------------------------------------
const container = document.querySelector('#form');
const linkProperties = {
    rooms: "3",
    livingRooms: "2",
    offset: "0"
};
container.addEventListener("change", event => {
    const name = event.target.name;
    galeryList.empty();
    galleryItems.length = 0;
    linkProperties.offset = 0;
    linkProperties[name] = event.target.value;
    let newLink = addPropertiesInLink(link);
    const requestForm = getData(newLink); 
    requestForm
        .then(items => {
            if (items.total !== 0) {
                if (items.total > maxLimitOnPage) {
                    linkProperties.offset = items.total - (items.total - maxLimitOnPage);
                    showButton.show();
                } else {
                    showButton.hide();
                }
                items.docs.forEach(item => 
                    galleryItems.push(addGaleryItem(item)));
                galleryItems.forEach(item => galeryList.append(item));
            } else {
                galeryList.append(errEmptyGalery()); 
                showButton.hide();
            }
        }).catch(error => console.error(error));
});
//------------------------------------------------------------------

countriesNames
    .then(countries => {
        countries.forEach(country =>
            countriesArr.push(addCountryToList(country)));
        countriesArr.forEach(item => countryList.append(item));
        countryList[0].value = '';
    }).catch(error => console.error(error));

itemsNames
    .then(items => {
        items.docs.forEach(item => 
            galleryItems.push(addGaleryItem(item)));
        galleryItems.forEach(item => galeryList.append(item));
    }).catch(error => console.error(error));