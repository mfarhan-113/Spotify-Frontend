let currentsong=new Audio()
let songs;
let currFolder;

async function getSongs(folder){
    currFolder=folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`)
    let response=await a.text()
    let div=document.createElement("div")
    div.innerHTML=response;
    let as = div.getElementsByTagName("a");
    songs=[]
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if(element.href.includes(`.mp3`)){
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    } 


    
    let songul = document.querySelector(".songlist").getElementsByTagName( "ul" )[0]
    songul.innerHTML=""
    for (const song of songs) {
        songul.innerHTML+=`<li><img class="invert" src="/img/music.svg" alt="">
        <div class="info">
          <div>${song.replaceAll("%20"," ")}</div>
          <div>Farhan</div>
        </div>
        <div class="playnow">
          <span>Playnow</span>
          <img class="invert" src="/img/play.svg" alt="">
        </div> </li>`
    }
    // Attach an event listener to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e=>{
        e.addEventListener("click",elements=>{
            playSongs(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
        
    })
    return songs
}

function formatTime(seconds) {
    if(isNaN(seconds) || seconds<0){
        return "00:00"
    }
    // Calculate minutes and remaining seconds
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    // Format minutes and seconds with leading zeros
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    // Return formatted time
    return formattedMinutes + ':' + formattedSeconds;
}

const playSongs=(track,pause=false)=>{
    // let audio=new Audio("/songs/"+track)
    currentsong.src=`/${currFolder}/`+track
    if(!pause){

        currentsong.play()
        play.src="/img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML=decodeURI(track)
    document.querySelector(".songtime").innerHTML="00:00 / 00:00"
}

async function displayAlbums(){
    let a = await fetch(`http://127.0.0.1:5500/songs`)
    let response=await a.text()
    let div=document.createElement("div")
    div.innerHTML=response;
    let anchors=div.getElementsByTagName("a")
    let cardContainer=document.querySelector(".cardContainer")
    let array=Array.from(anchors)
        for (let index = 0; index < array.length; index++) {
            const e = array[index];
        
        
        if(e.href.includes("/songs")){
            if(e.href.split("/").slice(-2)[1]!="songs"){
                let fold=e.href.split("/").slice(-2)[1];
                let a = await fetch(`http://127.0.0.1:5500/songs/${fold}/info.json`)
                let response=await a.json()
                cardContainer.innerHTML+=`<div data-folder="${fold}" class="card">
                <div  class="play">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="50" height="50">
                    <!-- Circular background -->
                    <circle cx="12" cy="12" r="10" fill="#1fdf64" />
                    <!-- Play button -->
                    <path d="M15.5 12L9.5 8V16" fill="black" />
                  </svg>
                </div>
                  <img src="/songs/${fold}/cover.jpg" alt="">
                  <h2>${response.title}</h2>
                  <p>${response.description}</p>
              </div>`
                
            }
            
        }
    }

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e=>{
        
        e.addEventListener("click",async item=>{
            songs=await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playSongs(songs[0])
        })
    })
}

async function main(){
    
    // Get the list of all song
    await getSongs("songs/ncs")
    playSongs(songs[0],true)

    displayAlbums()
    

    // Attach an event listener to play, next and previous
    play.addEventListener("click",()=>{
        if(currentsong.paused){
            currentsong.play()
            play.src="/img/pause.svg"
        }
        else{
            currentsong.pause()
            play.src="/img/play.svg"
        }
    })

    //  Listen for timeupdate event
    currentsong.addEventListener("timeupdate",()=>{
        document.querySelector(".songtime").innerHTML=`${formatTime(currentsong.currentTime)}:${formatTime(currentsong.duration)}`
        document.querySelector(".circle").style.left=(currentsong.currentTime/currentsong.duration)*100+"%"
    })

    //  Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click",e=>{
        let percent=(e.offsetX/e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left= percent+ "%"
        currentsong.currentTime=(currentsong.duration*percent)/100
    })

    //  Add an event Listener for hamburger
    document.querySelector(".hamburger").addEventListener("click",()=>{
        document.querySelector(".left").style.left="0"
    })

    //  Add an event Listener for hamburger close button
    document.querySelector(".close").addEventListener("click",()=>{
        document.querySelector(".left").style.left="-120%"
    })

    // Add an event listener to previous
    prev.addEventListener("click",()=>{
        
        let index= songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
        if((index-1)>=0){
            playSongs(songs[index-1])
        }
    })
    
    // Add an event listener to previous
    next.addEventListener("click",()=>{
        let index= songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
        if((index+1)<songs.length){
            playSongs(songs[index+1])
        }
    })

    // Event for volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener('change',(e)=>{
        currentsong.volume=parseInt(e.target.value)/100
    })

    // Add event for mute the  audio
    document.querySelector(".volume>img").addEventListener("click",e=>{
        if(e.target.src.includes("/img/volume.svg")){
            e.target.src=e.target.src.replace("/img/volume.svg","/img/mute.svg")
            currentsong.volume=0;
            document.querySelector(".range").getElementsByTagName("input")[0].value=0;
        }
        else{
            e.target.src=e.target.src.replace("/img/mute.svg","/img/volume.svg")
            // currentsong.play();
            currentsong.volume=.10;
            document.querySelector(".range").getElementsByTagName("input")[0].value=10;
        }
    })
}

main()