window.onload = function(){
  /*变量定义：
  1.html DOM变量： audio，
  2.audio
  3.db
  */
 const section =document.querySelector('section');
 const audios = [
   {'name':'王菲心经'},
   {'name':'金刚经'}
 ];
 let db;
   /*方法定义:
  初始化：对播放列表进行判断，如果本地indexdb有，则（播放），如果没有则（远程获取）；
    ---播放：获取src数据源的url，挂载audio元素
    ---远程获取：远程获取数据，（播放），（保存数据）
         ---保存数据：
  */
  /*
 主线：打开数据库，成功后，初始化
  */

function init(){
  for(let i=0;i<audios.length;i++){
    let objectStore=db.transaction('audios').objectStore('audios');
    let request = objectStore.get(audios[i].name);
    request.onerror= function () {
      alert("出错了")
    };
    request.onsuccess = function(){
      if(request.result){
        console.log("读取本地数据");
        displayAudio(request.result.mp3,request.result.name); 
      }else {
        fetchAudioFromNetwork(audios[i]);
      }
    }
  }
};

function displayAudio (mp3Blob,title){
  console.log(mp3Blob);
  let mp3url = URL.createObjectURL(mp3Blob);  
  const audio = document.createElement('audio');

  let article = document.createElement('article');
  let h2 = document.createElement('h2');
  h2.textContent = title;
  audio.src = mp3url;
  audio.controls = true;
  section.appendChild(article);
  article.appendChild(h2);
  h2.appendChild(audio);   
}

function fetchAudioFromNetwork(audio){
  // fetch('audio/'+audio.name+'.mp3').then(response=>{
  //   response.blob();}).then(function(value){
  //     displayAudio(value,audio.name);
  //     storeAudio(value,audio.name);
  //   });

  let mp3Blob = fetch('audio/' + audio.name + '.mp3').then(response =>
    response.blob()
  );
  // Only run the next code when both promises have fulfilled
  Promise.all([mp3Blob]).then(function(values) {
    // display the video fetched from the network with displayVideo()
    displayAudio(values[0],audio.name);
    // store it in the IDB using storeVideo()
    storeAudio(values[0],audio.name);
  });
}

function storeAudio(mp3Blob,name){
  let objectStore = db.transaction(['audios'],'readwrite').objectStore('audios');

  let record = {
    name: name,
    mp3: mp3Blob
  }
  let request = objectStore.add(record);
  request.onerror=function (){
    console.log(request.error);
  };
  request.onsuccess=function(){
    console.log('Record addition attempt finished');
  };
}

  let request = window.indexedDB.open('audios',1);

  request.onerror = function() {
    console.log('Database failed to open');
  };

  // onsuccess handler signifies that the database opened successfully
  request.onsuccess = function() {
    console.log('Database opened succesfully');
    // Store the opened database object in the db variable. This is used a lot below
    db = request.result;
    init();
  };

  request.onupgradeneeded=function(e){
    let db = e.target.result;
    let objectStore = db.createObjectStore('audios',{keyPath:'name'});
    objectStore.createIndex('mp3','mp3',{unique:false});
    console.log(request.error);
  };
};



