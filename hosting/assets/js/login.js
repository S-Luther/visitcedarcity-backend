var UserD = "";
/**
* Function called when clicking the Login/Logout button.
*/
var filterReturnable,schedulefilterReturnable, biasReturnable, db, attractionsReturnable = [], toggleReturnable = [true,true,true,true,true,true,true]
const biaslist = document.querySelector('#biaslist');
const filterlist = document.querySelector('#filterlist');
const schedulelist = document.querySelector('#schedulelist');
const schedulefilterlist = document.querySelector('#schedulefilterlist');

let schedulefilters = [];

const attractionlist = document.querySelector('#attractionlist');
function toggleSignIn() {
    if (!firebase.auth().currentUser) {
        var provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('https://www.googleapis.com/auth/plus.login');
        firebase.auth().signInWithRedirect(provider);
        
    }
    else {
        localStorage.setItem("loggedin", false);
        firebase.auth().signOut();
    }
    document.getElementById('quickstart-sign-in').disabled = true;
}
var modal = document.getElementById("authModal");

var span = document.getElementsByClassName("close")[0];
var spaces = " "
/**
*  writes user info to the database
*  called from within initApp funtion for when a user logs in
*/
admins = ["samluther998@gmail.com", "abennett@ironcounty.net", "mtwitchell@ironcounty.net", "wihler@ironcounty.net", "tourism.comm@ironcounty.net","bernardkintzing@gmail.com","info@goldblockchain.us"]
// function writeUserData(userId, name, email, imageUrl) {
//     var userRef = firebase.database().ref('users/');
    
//     //new method of checking if the user exists
    
//     userRef.orderByChild("id").equalTo(userId).on("value", function(data) {
//         if(!data.exists()){
//             // //console.log("do it");
//                 firebase.database().ref('users/' + userId).set({
//                     username: name,
//                     id: userId,
//                     email: email,
//                     profile_picture : imageUrl
//                 });
//                 localStorage.setItem("loggedin", true);

//         }else{
//             localStorage.setItem("loggedin", true);
//         }
//     });
    

// }

/**
* initApp handles setting up UI event listeners and registering Firebase auth listeners:
*  - firebase.auth().onAuthStateChanged: This listener is called when the user is signed in or
*    out, and that is where we update the UI.
*  - firebase.auth().getRedirectResult(): This promise completes when the user gets back from
*    the auth redirect flow. It is where you can get the OAuth access token from the IDP.
*/

function removeBias(str){
    var index = biasReturnable.indexOf(str)
    biasReturnable.splice(index, 1);
    db.collection('Biases').doc('current').update({
        current: JSON.stringify(biasReturnable),
    });
}
function removeFilter(str){
    var index = filterReturnable.indexOf(str)
    filterReturnable.splice(index, 1);
    db.collection('Filters').doc('current').update({
        current: JSON.stringify(filterReturnable),
    });
}
function removeScheduleFilter(str){
    var index = schedulefilterReturnable.indexOf(str)
    schedulefilterReturnable.splice(index, 1);
    db.collection('ScheduleFilters').doc('current').update({
        current: JSON.stringify(schedulefilterReturnable),
    });

}
function addScheduleFilter(str){

    schedulefilterReturnable.push(str)
    db.collection('ScheduleFilters').doc('current').update({
        current: JSON.stringify(schedulefilterReturnable),
    });
    
}
function removeAttraction(str, title, subtitle, description, url, image, lat, lng){
    var index = 0
    if (confirm("Are you sure?") == true) {
        //console.log("You pressed OK!");
    
        attractionsReturnable.forEach(el =>{
            if(str === el.id.toString()){
                attractionsReturnable.splice(index, 1);
            }
            index++
        })
        db.collection('Custom').doc('current').update({
            current: JSON.stringify(attractionsReturnable),
        });
        attractions.title.value = title;
        attractions.subtitle.value = subtitle;
        attractions.url.value = url;
        attractions.description.value = description;
        attractions.img.value = image;
        attractions.lat.value = lat;
        attractions.lng.value = lng;
        document.body.scrollTop = document.documentElement.scrollTop = "100px";
    }
}

function initApp() {

    if(localStorage.getItem("loggedin") && admins.includes(localStorage.getItem("current_uid"))){
        modal.style.display = "none";
        db = firebase.firestore();
        db.collection('Biases').onSnapshot(snapshot => {
            //     let changes = snapshot
            let changes = snapshot.docChanges();
            changes.forEach(change => {
    
                //console.log(change.doc.data().current);
                biasReturnable = JSON.parse(change.doc.data().current)
                biaslist.innerHTML = ""
                biasReturnable.forEach(el => {
                    biaslist.innerHTML = biaslist.innerHTML + '<li><button onClick="removeBias(\''+el+'\')" class="icon fa-close">'+el+'<span class="label">delete</span></button></li>'
                })
            })
    
        });
        db.collection('Filters').onSnapshot(snapshot => {
            //     let changes = snapshot

            let changes = snapshot.docChanges();
            changes.forEach(change => {
    
                //console.log(change.doc.data().current);
                filterReturnable = JSON.parse(change.doc.data().current)
                filterlist.innerHTML = ""
                
                filterReturnable.forEach(el => {
                    filterlist.innerHTML = filterlist.innerHTML + '<li><button onClick="removeFilter(\''+el+'\')" class="icon fa-close">'+el+'<span class="label">delete</span></button></li>'
                
    
                })
            })
    
        });
        db.collection('ScheduleFilters').onSnapshot(snapshot => {
            //     let changes = snapshot

            let changes = snapshot.docChanges();
            changes.forEach(change => {
    
                //console.log(change.doc.data().current);
                schedulefilterReturnable = JSON.parse(change.doc.data().current)
                schedulefilterlist.innerHTML = ""
                
                schedulefilterReturnable.forEach(el => {
                    schedulefilterlist.innerHTML = schedulefilterlist.innerHTML + '<li><button onClick="removeScheduleFilter(\''+el+'\')" class="icon fa-close">'+el+'<span class="label">delete</span></button></li>'
    
                })
            })
    
        });
        db.collection('Schedules').onSnapshot(snapshot => {
            //     let changes = snapshot
            let changes = snapshot.docChanges();
            
            changes.forEach(change => {
    
                //console.log(change.doc.data().current);
                schedulesReturnable = JSON.parse(change.doc.data().current.slice(0,-1) + "]}")["schedule"]
                var date = new Date();

                schedulesReturnable.forEach(el => {
                    el.groups.forEach(elem => {
                        var thedate = new Date(el.date);
                        if((thedate.getTime() > date.getTime()) && !schedulefilterReturnable.includes(el.date+" • "+elem.sessions[0].name)){
                        schedulelist.innerHTML = schedulelist.innerHTML +'<li style="font-size:12px;"><div style=" ">&nbsp;&nbsp;&nbsp;&nbsp;<div class="date">'+el.date+ "</div> • " +elem.sessions[0].name+" • " +elem.sessions[0].location+'&nbsp;&nbsp;<div style="text-align:right"><button onClick="addScheduleFilter(\''+el.date+" • "+elem.sessions[0].name+'\')">Filter Out</button></div></div></li>'
    
                        }
                    })


    
                })
            })
            sort('#schedulelist>li', 'div.date');

            function sort(list, key) {
                $($(list).get().reverse()).each(function(outer) {
                    var sorting = this;
                    $($(list).get().reverse()).each(function(inner) {
                        if($(key, this).text().localeCompare($(key, sorting).text()) > 0) {
                            this.parentNode.insertBefore(sorting.parentNode.removeChild(sorting), this);
                        }
                    });
                });
            }
        });

        db.collection('Custom').onSnapshot(snapshot => {
            //     let changes = snapshot
            let changes = snapshot.docChanges();
            changes.forEach(change => {
    
                //console.log(change.doc.data().current);
                attractionsReturnable = JSON.parse(change.doc.data().current)
                attractionlist.innerHTML = ""
                attractionsReturnable.forEach(el => {
                    attractionlist.innerHTML = attractionlist.innerHTML + '<li><div onClick="removeAttraction(\''+el.id+'\',\''+el.title+'\',\''+el.subtitle+'\',\''+el.description+'\',\''+el.url+'\',\''+el.image+'\',\''+el.coordinates.lat+'\',\''+el.coordinates.lng+'\')" class="card icon fa-close"><img class="image noround" src="'+el.image+'"/><p class="notop">'+el.title+'</p></div></li>'
                })
            })
    
        });
        db.collection('Toggler').onSnapshot(snapshot => {
            //     let changes = snapshot
            let changes = snapshot.docChanges();
            changes.forEach(change => {
    
                //console.log(change.doc.data().current);
                toggleReturnable = JSON.parse(change.doc.data().current)
                var index = 0;
                toggleReturnable.forEach(el => {
                    document.getElementById(index.toString()).checked = toggleReturnable[index];
                    index++;
                })
            })
    
        });
    }
    
    firebase.auth().getRedirectResult().then(function(result) {
    var user = result.user;
    localStorage.setItem("current_uid", user.uid);
    //console.log(user.uid);
    localStorage.setItem("lsUser", user);
    db = firebase.firestore();
    db.collection('Biases').onSnapshot(snapshot => {
        //     let changes = snapshot
        let changes = snapshot.docChanges();
        changes.forEach(change => {

            //console.log(change.doc.data().current);
            biasReturnable = JSON.parse(change.doc.data().current)
            biaslist.innerHTML = ""
            biasReturnable.forEach(el => {
                biaslist.innerHTML = biaslist.innerHTML + '<li><button onClick="removeBias(\''+el+'\')" class="icon fa-close">'+el+'<span class="label">delete</span></button></li>'
            })
        })

    });
    db.collection('Filters').onSnapshot(snapshot => {
        //     let changes = snapshot
        let changes = snapshot.docChanges();
        changes.forEach(change => {

            //console.log(change.doc.data().current);
            filterReturnable = JSON.parse(change.doc.data().current)
            filterlist.innerHTML = ""
            filterReturnable.forEach(el => {
                filterlist.innerHTML = filterlist.innerHTML + '<li><button onClick="removeFilter(\''+el+'\')" class="icon fa-close">'+el+'<span class="label">delete</span></button></li>'


            })
        })

    });
    db.collection('ScheduleFilters').onSnapshot(snapshot => {
        //     let changes = snapshot

        let changes = snapshot.docChanges();
        changes.forEach(change => {

            //console.log(change.doc.data().current);
            schedulefilterReturnable = JSON.parse(change.doc.data().current)
            schedulefilterlist.innerHTML = ""
            
            schedulefilterReturnable.forEach(el => {
                schedulefilterlist.innerHTML = schedulefilterlist.innerHTML + '<li><button onClick="removeScheduleFilter(\''+el+'\')" class="icon fa-close">'+el+'<span class="label">delete</span></button></li>'


            })
        })

    });
    db.collection('Schedules').onSnapshot(snapshot => {
        //     let changes = snapshot
        let changes = snapshot.docChanges();
        
        changes.forEach(change => {

            //console.log(change.doc.data().current);
            schedulesReturnable = JSON.parse(change.doc.data().current.slice(0,-1) + "]}")["schedule"]
            var date = new Date();

            schedulesReturnable.forEach(el => {
                el.groups.forEach(elem => {
                    var thedate = new Date(el.date);
                    if((thedate.getTime() > date.getTime()) && !schedulefilterReturnable.includes(el.date+" • "+elem.sessions[0].name)){
                    schedulelist.innerHTML = schedulelist.innerHTML +'<li style="font-size:12px;"><div style=" ">&nbsp;&nbsp;&nbsp;&nbsp;<div class="date">'+el.date+ "</div> • " +elem.sessions[0].name+" • " +elem.sessions[0].location+'&nbsp;&nbsp;<div style="text-align:right"><button onClick="addScheduleFilter(\''+el.date+" • "+elem.sessions[0].name+'\')">Filter Out</button></div></div></li>'

                    }
                })



            })
        })
        sort('#schedulelist>li', 'div.date');

        function sort(list, key) {
            $($(list).get().reverse()).each(function(outer) {
                var sorting = this;
                $($(list).get().reverse()).each(function(inner) {
                    if($(key, this).text().localeCompare($(key, sorting).text()) > 0) {
                        this.parentNode.insertBefore(sorting.parentNode.removeChild(sorting), this);
                    }
                });
            });
        }
    });

    db.collection('Custom').onSnapshot(snapshot => {
        //     let changes = snapshot
        let changes = snapshot.docChanges();
        changes.forEach(change => {

            //console.log(change.doc.data().current);
            attractionsReturnable = JSON.parse(change.doc.data().current)
            attractionlist.innerHTML = ""
            attractionsReturnable.forEach(el => {
                attractionlist.innerHTML = attractionlist.innerHTML + '<li><div onClick="removeAttraction(\''+el.id+'\',\''+el.title+'\',\''+el.subtitle+'\',\''+el.description+'\',\''+el.url+'\',\''+el.image+'\',\''+el.coordinates.lat+'\',\''+el.coordinates.lng+'\')" class="card icon fa-close"><img class="image noround" src="'+el.image+'"/><p class="notop">'+el.title+'</p></div></li>'
            })
        })

    });
    db.collection('Toggler').onSnapshot(snapshot => {
        //     let changes = snapshot
        let changes = snapshot.docChanges();
        changes.forEach(change => {

            //console.log(change.doc.data().current);
            toggleReturnable = JSON.parse(change.doc.data().current)
            var index = 0;
            toggleReturnable.forEach(el => {
                document.getElementById(index.toString()).checked = toggleReturnable[index];
                index++;
            })
        })

    });

    // calls funtion to write to firebase
    // this might need to be called from a different location if data is being overwritten
    
    // writeUserData(user.uid, user.displayName, user.email, user.photoURL);
    
    
    }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;

        if (errorCode === 'auth/account-exists-with-different-credential') {
            alert('You have already signed up with a different auth provider for that email.');
            // If you are using multiple auth providers on your app you should handle linking
            // the user's accounts here.
        }
    });
    // Listening for auth state changes.
    // [START authstatelistener]
    firebase.auth().onAuthStateChanged(function(user) {
        if (user && admins.includes(user.email)) {
            localStorage.setItem("loggedin", true);
                span.onclick = function() {
                    modal.style.display = "none";
                  }
                  
                  // When the user clicks anywhere outside of the modal, close it
                  window.onclick = function(event) {
                    if (event.target == modal) {
                      modal.style.display = "none";
                    }
                  }
            

            UserD = user.uid;
            // User is signed in.
            localStorage.setItem("current_uid", user.email);
            
            // writeUserData(user.uid, user.displayName, user.email, user.photoURL);


            document.getElementById('quickstart-sign-in').textContent = 'Sign out';

        }
        else {

            span.onclick = function() {
               alert("Please Sign In");
              }
              
              // When the user clicks anywhere outside of the modal, close it
              window.onclick = function(event) {
                if (event.target == modal) {
                    alert("Please Sign In");
                }
              }
            document.getElementById('quickstart-sign-in').textContent = 'Sign in with Google';
        }
        document.getElementById('quickstart-sign-in').disabled = false;
    });
    
    document.getElementById('quickstart-sign-in').addEventListener('click', toggleSignIn, false);
}

window.onload = function() {
    initApp();
};

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//     apiKey: "AIzaSyBZA9u1NyUyA2aWEltYwguVMoVEry9gzlE",
//     authDomain: "visitcedarcity-backend.firebaseapp.com",
//     databaseURL: "https://visitcedarcity-backend-default-rtdb.firebaseio.com",
//     projectId: "visitcedarcity-backend",
//     storageBucket: "visitcedarcity-backend.appspot.com",
//     messagingSenderId: "449734764848",
//     appId: "1:449734764848:web:bbb05df8f855c0c69740f5",
//     measurementId: "G-3GWY8B1CE8"
//   };
//   firebase.initializeApp(firebaseConfig);

jQuery("#schedulein").keyup(function () {
    var filter = jQuery(this).val();
    jQuery("#schedulelist>li").each(function () {
        if (jQuery(this).text().search(new RegExp(filter, "i")) < 0) {
            jQuery(this).hide();
        } else {
            jQuery(this).show()
        }
    });
});


const bias = document.querySelector('#bias')
const filter = document.querySelector('#filter')
const attractions = document.querySelector('#attractions')

filter.addEventListener('submit', (e) => {
    e.preventDefault();
	//console.log(e)
	filterReturnable.push(filter.filterin.value)
    db.collection('Filters').doc('current').update({
        current: JSON.stringify(filterReturnable),
    });
   
    filter.filterin.value = '';
});

function toggleComp(i){
    toggleReturnable[i] = !toggleReturnable[i]
    db.collection('Toggler').doc('current').update({
        current: JSON.stringify(toggleReturnable),
    });
}


// var filterReturnable = db.collection('Filters').doc('current').current
var id = 8374568345383847

bias.addEventListener('submit', (e) => {
    e.preventDefault();
	//console.log(e)

	biasReturnable.push(bias.biasin.value)
    db.collection('Biases').doc('current').update({
        current: JSON.stringify(biasReturnable),
    });
   
    bias.biasin.value = '';
});
filter.addEventListener('submit', (e) => {
    e.preventDefault();
	//console.log(e)
	filterReturnable.push(filter.filterin.value)
    db.collection('Filters').doc('current').update({
        current: JSON.stringify(filterReturnable),
    });
   
    filter.filterin.value = '';
});
attractions.addEventListener('submit', (e) => {
    e.preventDefault();
    //console.log(attractions)
	//console.log(attractions.subtitle)
    //console.log(attractions.subtitle.value)

    id = id + Math.floor(Math.random() * 100000000);
    var temp =   {
        id: id,
        title: attractions.title.value,
        subtitle: attractions.subtitle.value,
        url: attractions.url.value,
        description: attractions.description.value,
        image: attractions.img.value,
        categories: [],    
        coordinates: {
          lat: attractions.lat.value, 
          lng: attractions.lng.value,
        },
      }
      attractionsReturnable.push(temp)
      //console.log(attractionsReturnable)
    db.collection('Custom').doc('current').update({
        current: JSON.stringify(attractionsReturnable),
    });
   
    attractions.title.value = '';
    attractions.subtitle.value = '';
    attractions.url.value = '';
    attractions.description.value = '';
    attractions.img.value = '';
    attractions.lat.value = '';
    attractions.lng.value = '';
});