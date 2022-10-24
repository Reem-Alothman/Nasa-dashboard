let store = Immutable.Map({
    user: Immutable.Map({ name: 'Student' }),
    apod: '',
    rovers: Immutable.List(['curiosity', 'opportunity', 'spirit']),
    currentRover: ''
})

// add our markup to the page
const root = document.getElementById('root')

const updateStore = (state, newState) => {
    store = state.merge(newState)
    render(root, store)
}

const render = async (root, state) => {
    root.innerHTML = App(state)
}


// create content
const App = (state) => {
    let rovers = state.get('rovers')
    let apod = state.get('apod')
    let currentRover = state.get('currentRover')
    if (state.get('currentRover') === ''){
        return `
            <header>
                ${renderTabs()}
            </header>
            <main>
                ${Greeting(state.getIn(['user', 'name']))}<br>
                <section>
                    <h5>The latest picture</h5><br>
                    ${ImageOfTheDay(state)}
                </section>
            </main>
            <footer></footer>
        `
    } else {
        let roverImages = currentRover.get('latest_photos')._tail.array;
        return `
        <header>
            ${renderTabs()}
        </header>
        <main>
            <div class="container">
                ${initRoverInfo(roverInfo, currentRover)}
                ${initGallery(renderImages, currentRover)}
            </div>
        </main>       
        <footer></footer>
        `
    }
}

const renderTabs = () => {
    return `<div class="tab">
    <button class="tablinks" onclick="getImagesByRoverName('Curiosity', store)">Curiosity</button>
    <button class="tablinks" onclick="getImagesByRoverName('Opportunity', store)">Opportunity</button>
    <button class="tablinks" onclick="getImagesByRoverName('Spirit', store)">Spirit</button>
    </div>`
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, store)
})

// ------------------------------------------------------  COMPONENTS

// Pure function that renders conditional information -- THIS IS JUST AN EXAMPLE, you can delete it.
const Greeting = (name) => {
    if (name) {
        return `
            <h3>Welcome, ${name}!</h3>
        `
    }

    return `
        <h1>Hello!</h1>
    `
}

// Example of a pure function that renders infomation requested from the backend
const ImageOfTheDay = (state) => {
    let apod = state.get('apod')
    if (!apod) {
        getImageOfTheDay(state)
    } else if (apod.get(['image', 'media_type']) === "video"){ 
        // fallback in case the image of the day is a video
        return `https://apod.nasa.gov/apod/image/2102/Siemiony_las_31_01_2021_1024.jpg`

    } else {
        return (`
        <img src="${apod.get('image').get('url')}" height="350px" width="100%" />
        <p>${apod.get('image').get('explanation')}</p>

        `)
    }
}

// ------------------------------------------------------  API CALLS

// Example API call
const getImageOfTheDay = (state) => {
    let { apod } = state

    fetch(`http://localhost:3000/apod`)
        .then(res => res.json())
        .then(apod => updateStore(store, { apod }))

    return apod
}

const getImagesByRoverName = async (roverName, state) => {
    console.log('----------- inside get image by rover name ------------')
    let { currentRover } = roverName;

    fetch(`http://localhost:3000/rovers/${roverName}`) 
        .then(res => res.json())
        .then(currentRover => updateStore(store, {currentRover}))
        .then(console.log(store))

    return currentRover
}

const roverInfo = (currentRover) => {

    let roverImages = currentRover.get('latest_photos')._tail.array;
    let rInfo = roverImages[0].get('rover');

    let info = `
                <ul class="RoverInfo">
                    <li>Launch Date: ${rInfo.get('launch_date')}</li>
                    <li>Landing Date: ${rInfo.get('landing_date')}</li>
                    <li>Status: ${rInfo.get('status')}</li>
                </ul><br> `
    
    return info;
}

const renderImages = (currentRover) => {

    let roverImages = currentRover.get('latest_photos')._tail.array;
    let gallery = ''

    for(let i=0; i<roverImages.length; i++){
        gallery += `
            <div class="card">
                <img src="${roverImages[i].get('img_src')}" width="100%" />
                <h4>Date: ${roverImages[i].get('earth_date')}</h4>            
            </div>
        `;
    }

    return gallery;
}


// ----------------- higher-order functions ------------------


const initRoverInfo = (roverInfo, currentRover) => {
    
    let val = `<h3 class="title">Discover everything to know about ${currentRover.get('latest_photos')._tail.array[0].getIn(['rover','name'])} </h3><br>
               ${roverInfo(currentRover)}`
    
    return val;
}

const initGallery = (renderImages, currentRover) => {

    let val = `<h3>Most recently available photos</h3><br>		
        <div class="gallery">${renderImages(currentRover)}</div>`
    
    return val;
}