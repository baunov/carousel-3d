import './style.scss';
import {Carousel} from "./carousel.ts";

const CARDS_COUNT: number = 20;
const IMAGES: string[] = [
    'https://img.championat.com/c/1350x759/news/big/z/j/the-elder-scrolls-v-skyrim-anniversary-edition-vyshla-na-pk-i-konsolyah_1636612065810839074.jpg',
    'https://buy.thewitcher.com/build/images/home/bg-witcher3-1440@1x-ce4038c1.jpg',
    'https://blz-contentstack-images.akamaized.net/v3/assets/blt77f4425de611b362/blt6d7b0fd8453e72b9/646e720a71d9db111a265e8c/d4-open-graph_001.jpg',
    'https://cdn1.epicgames.com/ca4058f18b0a4a9e9e2ccc28f7f33000/offer/EGS_WarhorseStudios_KingdomComeDeliverance_S3-1360x766-1e8502930c6282cb34acf7add01c6832a5bc217e.jpg'
];

const CARDS_IMAGES = new Array(CARDS_COUNT).fill(null).map((_, index) => {
    return IMAGES[index % IMAGES.length];
});

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="main">
  </div>
`;

const carousel = new Carousel(
    document.querySelector<HTMLDivElement>('.main')!,
    CARDS_IMAGES,
    {
        radius: window.innerWidth / 4
    }
);

carousel.start();

window.addEventListener('resize', () => {
    carousel.radius = window.innerWidth / 4;
});
