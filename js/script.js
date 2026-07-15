const menuButton = document.querySelector(".menu-toggle");

const mobileMenu = document.querySelector(".mobile-menu");


if(menuButton){

    menuButton.addEventListener("click", () => {

        mobileMenu.classList.toggle("active");

        menuButton.classList.toggle("open");

    });

}