import {getPointOnCircle} from "./utils/get-point-on-circle.ts";
import {smooth, SmoothedFn} from "./utils/smooth.ts";

function createCarouselCard(img: string): HTMLDivElement {
    const cardWrapper = document.createElement('div');
    cardWrapper.classList.add('card-wrapper');

    cardWrapper.innerHTML = `
        <div class="card">
            <img src="${img}"/>
        </div>
        <div class="card-reflection">
            <img src="${img}"/>
        </div>
    `;
    return cardWrapper;
}

interface CarouselSettings {
    radius: number;
    minAnglePerCard?: number;
}

const CIRCLE = Math.PI * 2;
const X_OFFSET = 0;
const Y_OFFSET = -30;
const Z_OFFSET = 700;
const FPS = 60;
const FRAME_INTERVAL = 1000 / FPS;
const CARD_HEIGHT = 100;
const SIN_DEFORMATION_HEIGHT = 17;
const REFLECTION_GAP = 0.5;

const ANGLE_OFFSET = Math.PI / 2;

export class Carousel {
    private readonly cards: HTMLDivElement[];
    private readonly anglePerCard: number;
    private readonly totalAngle: number = 0;


    private _tgRadius = 0;
    private _activeIndex = 0;

    private animationFrame: number = 0;
    private lastFrameTime = 0;

    private readonly radiusFn: SmoothedFn;
    private readonly zOffsetFn: SmoothedFn = smooth(-5000, 40, 0.1);
    private readonly angleOffsetFn: SmoothedFn = smooth(-CIRCLE, 40, 0.0001);
    private readonly curActiveAngleFn: SmoothedFn = smooth(0, 15, 0.0001);

    private activeAngleOffset = 0;

    constructor(readonly container: HTMLDivElement,
                readonly cardsImages: string[],
                readonly settings: CarouselSettings) {
        this.cards = cardsImages.map(createCarouselCard);
        this.anglePerCard = Math.min(CIRCLE / cardsImages.length, settings.minAnglePerCard ?? CIRCLE / 17);
        this.totalAngle = this.anglePerCard * this.cards.length;


        this.cards.forEach((cardElem, index) => {
            container.appendChild(cardElem);
            cardElem.addEventListener('click', () => {
                this.activeIndex = index;
            })
        });
        this.cards[0].classList.add('active');

        this.radiusFn = smooth(settings.radius, 20, 0.1);
        this._tgRadius = settings.radius;

        this.activeIndex = 0;
    }

    set radius(val: number) {
        this._tgRadius = val;
    }

    get radius(): number {
        return this._tgRadius;
    }

    start() {
        this.onEnterFrame();
    }

    stop() {
        cancelAnimationFrame(this.animationFrame);
    }

    set activeIndex(index: number) {
        this.cards.forEach((card, i) => {
            if (i === index) {
                card.classList.add('active');
                card.style.willChange = 'unset';
            } else {
                card.classList.remove('active');
                card.style.willChange = 'transform';
            }
        });
        const angleDelta = this.getTargetRotationAngleDelta(index);
        this.activeAngleOffset = this.activeAngleOffset + angleDelta;
        this._activeIndex = index;
    }

    get activeIndex(): number {
        return this._activeIndex;
    }

    private getTargetRotationAngleDelta(targetIndex: number) {
        const currentAngle = this._activeIndex * this.anglePerCard % this.totalAngle;
        const targetAngle = targetIndex * this.anglePerCard % this.totalAngle;

        let deltaAngle = targetAngle - currentAngle;

        // Normalize the deltaAngle to the range -Math.PI to Math.PI
        if (deltaAngle > Math.PI) {
            deltaAngle -= CIRCLE;
        } else if (deltaAngle < -Math.PI) {
            deltaAngle += CIRCLE;
        }

        return deltaAngle;
    }

    private update(deltaTime: number = 0): void {
        const framesDelta = deltaTime / FRAME_INTERVAL;
        const {value: zOffset, done: zOffsetDone} = this.zOffsetFn(Z_OFFSET, framesDelta);
        const {value: angleOffset, done: angleOffsetDone} = this.angleOffsetFn(ANGLE_OFFSET, framesDelta);

        const tgAngle = this.activeAngleOffset + angleOffset;
        const {value: curActiveAngle, done: curActiveAngleDone} = this.curActiveAngleFn(tgAngle, framesDelta);
        const {value: radius, done: radiusDone} = this.radiusFn(this._tgRadius, framesDelta);

        this.cards.forEach((elem, index) => {
            const reflection = elem.querySelector('.card-reflection')! as HTMLElement;
            const img = elem.querySelector('.card')!.children.item(0)! as HTMLElement;
            const reflectionImg = reflection.children.item(0)! as HTMLElement;
            const angle = curActiveAngle - (index * this.anglePerCard);

            const [x, z] = getPointOnCircle(radius, angle);
            const tgZ = z + zOffset;
            const tgX = x + X_OFFSET;
            const tgY = Y_OFFSET - SIN_DEFORMATION_HEIGHT * Math.sin(angle *  3);
            const reflectionY = - Y_OFFSET - (CARD_HEIGHT + SIN_DEFORMATION_HEIGHT + REFLECTION_GAP) + tgY;


            const translate = `perspective(1600px) translateX(${tgX}px) translateZ(${tgZ}px) translateY(${tgY}px)`;
            const rotate = `rotateY(${Math.PI * 0.5 - angle}rad)`;
            const scale = `scale(${1 + Math.sin(angle) * 0.2})`;

            const transform = `${translate} ${rotate} ${scale}`;
            const opacity = `${z / radius + 1.1}`;
            const zIndex = `${Math.round(radius + z)}`;

            elem.style.transform = transform;
            elem.style.opacity = opacity;
            elem.style.zIndex = zIndex;

            const innerOffsetX = Math.cos(angle *  3) * 20;
            img.style.transform = `translateX(${innerOffsetX}px)`;

            reflection.style.transform = `rotateX(-180deg) translateY(${reflectionY}px)`;
            reflectionImg.style.transform = `translateX(${innerOffsetX}px)`;
        });

        if (zOffsetDone && angleOffsetDone && curActiveAngleDone && radiusDone) {
            console.log('DONE');
            this.cards.forEach((elem) => {
                elem.style.willChange = 'unset';
            });
        }
    }

    private onEnterFrame(time: number = 0): void {
        const deltaTime = time - this.lastFrameTime;
        this.update(deltaTime);
        this.lastFrameTime = time;

        this.animationFrame = requestAnimationFrame((t: number) => {
            this.onEnterFrame(t);
        });
    }
}
