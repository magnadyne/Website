var timer = 0;
var progress = 0;
const swiper = new Swiper('.swiper', 
{
    direction: 'horizontal',
    loop: true,
    
    autoplay: 
    {
        delay: 8000
    },
    pagination: 
    {
        el: '.swiper-pagination'
    },
    navigation: 
    {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
});

function updateBackgroundPosition() 
{
    timer = (timer + 0.5) % 96;
    //96 is the LCM of the image's width (32) and height (48)

    //document.body.style.backgroundPosition = `${timer}% ${-timer}%`;
    //Previous method before body::before started being used

    document.body.style.setProperty('--bg-pos', `${timer}px ${-timer}px`);
    //${x}% ${y}%

    requestAnimationFrame(updateBackgroundPosition);
}

requestAnimationFrame(updateBackgroundPosition);