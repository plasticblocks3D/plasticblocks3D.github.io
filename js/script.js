console.log(
"PlasticBlocks3D Loaded"
);



const menuButton =
document.querySelector(".menu-toggle");


const menu =
document.querySelector(".mobile-menu");



if(menuButton){


menuButton.addEventListener(
"click",
()=>{


menu.classList.toggle(
"open"
);


});



}