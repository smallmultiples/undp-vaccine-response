import React from "react";
import { ReactComponent as LogoUNDP } from "./undp-logo.svg";
import useMediaQuery from "../../hooks/use-media-query";
import styles from "./header.module.scss";
import isMapOnly from "../../modules/is-map-only";

const Header = () => {
    const { isMobile } = useMediaQuery();
    return (
        <header className={styles.headerContainer}>
            <div className={styles.header}>
                <div className={styles.title}>
                    <a className={styles.logo} href="./">
                        <LogoUNDP height={isMobile ? 60 : 80} width={isMobile ? 30 : 40} />
                    </a>
                    <div className={styles.headings}>
                        <div className={styles.mainHeading}>
                            <div className={styles.betaTag}>Beta</div>
                        </div>
                    </div>
                </div>
                <div className={styles.navButtons}>
                    <svg
                        width="674"
                        height="24"
                        viewBox="0 0 674 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            opacity="0.5"
                            d="M492.608 11.496C493.488 12.488 494.848 13.192 496.704 13.192C499.584 13.192 500.64 11.608 500.64 10.056C500.64 7.816 498.656 7.272 496.912 6.808C495.552 6.44 494.32 6.12 494.32 5.048C494.32 4.04 495.232 3.352 496.512 3.352C497.68 3.352 498.8 3.752 499.6 4.632L500.4 3.656C499.504 2.712 498.24 2.168 496.608 2.168C494.512 2.168 492.944 3.368 492.944 5.128C492.944 7.224 494.848 7.704 496.56 8.152C497.968 8.536 499.264 8.888 499.264 10.168C499.264 10.984 498.656 12.008 496.752 12.008C495.248 12.008 494.096 11.272 493.392 10.488L492.608 11.496ZM502.767 9.128C502.767 11.544 504.415 13.192 506.703 13.192C507.967 13.192 509.007 12.776 509.775 12.008L509.199 11.224C508.591 11.848 507.695 12.2 506.815 12.2C505.151 12.2 504.127 10.984 504.031 9.528H510.287V9.224C510.287 6.904 508.911 5.08 506.575 5.08C504.367 5.08 502.767 6.888 502.767 9.128ZM506.559 6.072C508.319 6.072 509.087 7.496 509.103 8.648H504.031C504.095 7.464 504.911 6.072 506.559 6.072ZM517.703 13H518.903V7.688C518.903 5.816 517.543 5.08 515.911 5.08C514.647 5.08 513.655 5.496 512.823 6.36L513.383 7.192C514.071 6.456 514.823 6.12 515.751 6.12C516.871 6.12 517.703 6.712 517.703 7.752V9.144C517.079 8.424 516.199 8.088 515.143 8.088C513.831 8.088 512.439 8.904 512.439 10.632C512.439 12.312 513.831 13.192 515.143 13.192C516.183 13.192 517.063 12.824 517.703 12.12V13ZM517.703 11.368C517.239 12.008 516.423 12.328 515.575 12.328C514.455 12.328 513.671 11.624 513.671 10.648C513.671 9.656 514.455 8.952 515.575 8.952C516.423 8.952 517.239 9.272 517.703 9.912V11.368ZM521.948 13H523.148V7.528C523.5 6.904 524.508 6.296 525.244 6.296C525.436 6.296 525.58 6.312 525.724 6.344V5.112C524.668 5.112 523.772 5.704 523.148 6.52V5.272H521.948V13ZM527.421 9.128C527.421 11.432 528.973 13.192 531.277 13.192C532.685 13.192 533.517 12.616 534.109 11.848L533.309 11.112C532.797 11.8 532.141 12.12 531.341 12.12C529.693 12.12 528.669 10.84 528.669 9.128C528.669 7.416 529.693 6.152 531.341 6.152C532.141 6.152 532.797 6.456 533.309 7.16L534.109 6.424C533.517 5.656 532.685 5.08 531.277 5.08C528.973 5.08 527.421 6.84 527.421 9.128ZM541.663 13H542.863V7.544C542.863 5.864 542.015 5.08 540.399 5.08C539.231 5.08 538.175 5.752 537.631 6.392V2.328H536.431V13H537.631V7.352C538.095 6.728 538.991 6.152 539.919 6.152C540.959 6.152 541.663 6.552 541.663 7.912V13ZM551 13H552.2V6.328H553.768V5.272H552.2V4.68C552.2 3.704 552.632 3.16 553.416 3.16C553.688 3.16 553.912 3.224 554.104 3.336L554.408 2.44C554.104 2.248 553.688 2.168 553.24 2.168C551.896 2.168 551 3.08 551 4.68V5.272H549.72V6.328H551V13ZM559.212 13.192C561.564 13.192 563.036 11.368 563.036 9.128C563.036 6.888 561.564 5.08 559.212 5.08C556.86 5.08 555.388 6.888 555.388 9.128C555.388 11.368 556.86 13.192 559.212 13.192ZM559.212 12.12C557.564 12.12 556.636 10.712 556.636 9.128C556.636 7.56 557.564 6.152 559.212 6.152C560.86 6.152 561.772 7.56 561.772 9.128C561.772 10.712 560.86 12.12 559.212 12.12ZM565.632 13H566.832V7.528C567.184 6.904 568.192 6.296 568.928 6.296C569.12 6.296 569.264 6.312 569.408 6.344V5.112C568.352 5.112 567.456 5.704 566.832 6.52V5.272H565.632V13ZM581.15 13H582.35V7.688C582.35 5.816 580.99 5.08 579.358 5.08C578.094 5.08 577.102 5.496 576.27 6.36L576.83 7.192C577.518 6.456 578.27 6.12 579.198 6.12C580.318 6.12 581.15 6.712 581.15 7.752V9.144C580.526 8.424 579.646 8.088 578.59 8.088C577.278 8.088 575.886 8.904 575.886 10.632C575.886 12.312 577.278 13.192 578.59 13.192C579.63 13.192 580.51 12.824 581.15 12.12V13ZM581.15 11.368C580.686 12.008 579.87 12.328 579.022 12.328C577.902 12.328 577.118 11.624 577.118 10.648C577.118 9.656 577.902 8.952 579.022 8.952C579.87 8.952 580.686 9.272 581.15 9.912V11.368ZM589.713 9.128C589.713 11.432 591.265 13.192 593.569 13.192C594.977 13.192 595.809 12.616 596.401 11.848L595.601 11.112C595.089 11.8 594.433 12.12 593.633 12.12C591.985 12.12 590.961 10.84 590.961 9.128C590.961 7.416 591.985 6.152 593.633 6.152C594.433 6.152 595.089 6.456 595.601 7.16L596.401 6.424C595.809 5.656 594.977 5.08 593.569 5.08C591.265 5.08 589.713 6.84 589.713 9.128ZM602.098 13.192C604.45 13.192 605.922 11.368 605.922 9.128C605.922 6.888 604.45 5.08 602.098 5.08C599.746 5.08 598.274 6.888 598.274 9.128C598.274 11.368 599.746 13.192 602.098 13.192ZM602.098 12.12C600.45 12.12 599.522 10.712 599.522 9.128C599.522 7.56 600.45 6.152 602.098 6.152C603.746 6.152 604.658 7.56 604.658 9.128C604.658 10.712 603.746 12.12 602.098 12.12ZM613.735 13H614.935V5.272H613.735V10.952C613.287 11.576 612.391 12.12 611.447 12.12C610.407 12.12 609.719 11.72 609.719 10.36V5.272H608.519V10.728C608.519 12.408 609.367 13.192 610.983 13.192C612.135 13.192 613.143 12.584 613.735 11.912V13ZM623.187 13H624.387V7.576C624.387 5.896 623.539 5.08 621.923 5.08C620.771 5.08 619.715 5.752 619.171 6.392V5.272H617.971V13H619.171V7.352C619.619 6.728 620.515 6.152 621.459 6.152C622.499 6.152 623.187 6.584 623.187 7.944V13ZM629.376 13.192C630.08 13.192 630.512 12.984 630.816 12.696L630.464 11.8C630.304 11.976 629.984 12.12 629.648 12.12C629.12 12.12 628.864 11.704 628.864 11.128V6.328H630.432V5.272H628.864V3.16H627.664V5.272H626.384V6.328H627.664V11.384C627.664 12.536 628.24 13.192 629.376 13.192ZM632.767 13H633.967V7.528C634.319 6.904 635.327 6.296 636.063 6.296C636.255 6.296 636.399 6.312 636.543 6.344V5.112C635.487 5.112 634.591 5.704 633.967 6.52V5.272H632.767V13ZM638.448 14.936L638.256 16.024C638.48 16.088 638.88 16.136 639.136 16.136C640.16 16.12 640.944 15.688 641.408 14.568L645.28 5.272H643.968L641.408 11.608L638.832 5.272H637.536L640.768 13.08L640.256 14.248C639.984 14.888 639.632 15.064 639.104 15.064C638.912 15.064 638.624 15.016 638.448 14.936Z"
                            fill="#110848"
                        />
                        <line
                            x1="464.5"
                            y1="23.5"
                            x2="673.5"
                            y2="23.5"
                            stroke="#E9ECF6"
                            stroke-linecap="round"
                        />
                        <path
                            d="M8.816 13H10.144V2.328H8.816V6.92H2.576V2.328H1.248V13H2.576V8.104H8.816V13ZM16.6066 13.192C18.9586 13.192 20.4306 11.368 20.4306 9.128C20.4306 6.888 18.9586 5.08 16.6066 5.08C14.2546 5.08 12.7826 6.888 12.7826 9.128C12.7826 11.368 14.2546 13.192 16.6066 13.192ZM16.6066 12.12C14.9586 12.12 14.0306 10.712 14.0306 9.128C14.0306 7.56 14.9586 6.152 16.6066 6.152C18.2546 6.152 19.1666 7.56 19.1666 9.128C19.1666 10.712 18.2546 12.12 16.6066 12.12ZM32.3549 13H33.5549V7.416C33.5549 5.864 32.8029 5.08 31.3949 5.08C30.2749 5.08 29.2349 5.816 28.8029 6.52C28.5789 5.72 27.9069 5.08 26.7229 5.08C25.5869 5.08 24.5469 5.896 24.2269 6.392V5.272H23.0269V13H24.2269V7.352C24.6429 6.728 25.4749 6.152 26.2589 6.152C27.2669 6.152 27.6829 6.776 27.6829 7.752V13H28.8829V7.336C29.2829 6.728 30.1309 6.152 30.9309 6.152C31.9229 6.152 32.3549 6.776 32.3549 7.752V13ZM36.1407 9.128C36.1407 11.544 37.7887 13.192 40.0767 13.192C41.3407 13.192 42.3807 12.776 43.1487 12.008L42.5727 11.224C41.9647 11.848 41.0687 12.2 40.1887 12.2C38.5247 12.2 37.5007 10.984 37.4047 9.528H43.6607V9.224C43.6607 6.904 42.2847 5.08 39.9487 5.08C37.7407 5.08 36.1407 6.888 36.1407 9.128ZM39.9327 6.072C41.6927 6.072 42.4607 7.496 42.4767 8.648H37.4047C37.4687 7.464 38.2847 6.072 39.9327 6.072Z"
                            fill="#110848"
                        />
                        <path
                            d="M94.0104 7.672C94.0104 10.824 96.1384 13.192 99.3064 13.192C102.458 13.192 104.602 10.824 104.602 7.672C104.602 4.52 102.458 2.152 99.3064 2.152C96.1384 2.152 94.0104 4.52 94.0104 7.672ZM103.226 7.672C103.226 10.152 101.69 12.008 99.3064 12.008C96.9064 12.008 95.3864 10.152 95.3864 7.672C95.3864 5.176 96.9064 3.336 99.3064 3.336C101.69 3.336 103.226 5.176 103.226 7.672ZM112.485 13H113.685V5.272H112.485V10.952C112.037 11.576 111.141 12.12 110.197 12.12C109.157 12.12 108.469 11.72 108.469 10.36V5.272H107.269V10.728C107.269 12.408 108.117 13.192 109.733 13.192C110.885 13.192 111.893 12.584 112.485 11.912V13ZM116.721 13H117.921V7.528C118.273 6.904 119.281 6.296 120.017 6.296C120.209 6.296 120.353 6.312 120.497 6.344V5.112C119.441 5.112 118.545 5.704 117.921 6.52V5.272H116.721V13ZM133.632 13H135.2L132.32 8.648C133.776 8.52 135.088 7.464 135.088 5.544C135.088 3.576 133.696 2.328 131.744 2.328H127.456V13H128.784V8.76H130.912L133.632 13ZM133.712 5.544C133.712 6.744 132.848 7.592 131.584 7.592H128.784V3.512H131.584C132.848 3.512 133.712 4.344 133.712 5.544ZM136.849 9.128C136.849 11.544 138.497 13.192 140.786 13.192C142.049 13.192 143.089 12.776 143.858 12.008L143.282 11.224C142.674 11.848 141.778 12.2 140.898 12.2C139.234 12.2 138.209 10.984 138.113 9.528H144.37V9.224C144.37 6.904 142.994 5.08 140.658 5.08C138.449 5.08 136.849 6.888 136.849 9.128ZM140.641 6.072C142.402 6.072 143.17 7.496 143.186 8.648H138.113C138.178 7.464 138.993 6.072 140.641 6.072ZM146.281 11.976C147.065 12.808 148.137 13.192 149.401 13.192C151.401 13.192 152.441 12.152 152.441 10.856C152.441 9.144 150.889 8.76 149.545 8.456C148.537 8.216 147.657 7.976 147.657 7.224C147.657 6.536 148.313 6.056 149.369 6.056C150.361 6.056 151.209 6.472 151.673 7.032L152.233 6.2C151.609 5.576 150.681 5.08 149.369 5.08C147.529 5.08 146.489 6.104 146.489 7.304C146.489 8.904 147.977 9.256 149.289 9.56C150.329 9.816 151.273 10.088 151.273 10.936C151.273 11.688 150.633 12.216 149.449 12.216C148.393 12.216 147.417 11.704 146.905 11.112L146.281 11.976ZM156.231 15.944V11.832C156.855 12.696 157.783 13.192 158.839 13.192C160.871 13.192 162.279 11.624 162.279 9.128C162.279 6.616 160.871 5.08 158.839 5.08C157.751 5.08 156.791 5.64 156.231 6.424V5.272H155.031V15.944H156.231ZM161.015 9.128C161.015 10.84 160.087 12.12 158.535 12.12C157.591 12.12 156.647 11.544 156.231 10.872V7.384C156.647 6.712 157.591 6.152 158.535 6.152C160.087 6.152 161.015 7.416 161.015 9.128ZM168.234 13.192C170.586 13.192 172.058 11.368 172.058 9.128C172.058 6.888 170.586 5.08 168.234 5.08C165.882 5.08 164.41 6.888 164.41 9.128C164.41 11.368 165.882 13.192 168.234 13.192ZM168.234 12.12C166.586 12.12 165.658 10.712 165.658 9.128C165.658 7.56 166.586 6.152 168.234 6.152C169.882 6.152 170.794 7.56 170.794 9.128C170.794 10.712 169.882 12.12 168.234 12.12ZM179.87 13H181.07V7.576C181.07 5.896 180.222 5.08 178.606 5.08C177.454 5.08 176.398 5.752 175.854 6.392V5.272H174.654V13H175.854V7.352C176.302 6.728 177.198 6.152 178.142 6.152C179.182 6.152 179.87 6.584 179.87 7.944V13ZM183.435 11.976C184.219 12.808 185.291 13.192 186.555 13.192C188.555 13.192 189.595 12.152 189.595 10.856C189.595 9.144 188.043 8.76 186.699 8.456C185.691 8.216 184.811 7.976 184.811 7.224C184.811 6.536 185.467 6.056 186.523 6.056C187.515 6.056 188.363 6.472 188.827 7.032L189.387 6.2C188.763 5.576 187.835 5.08 186.523 5.08C184.683 5.08 183.643 6.104 183.643 7.304C183.643 8.904 185.131 9.256 186.443 9.56C187.483 9.816 188.427 10.088 188.427 10.936C188.427 11.688 187.787 12.216 186.603 12.216C185.547 12.216 184.571 11.704 184.059 11.112L183.435 11.976ZM191.736 9.128C191.736 11.544 193.384 13.192 195.672 13.192C196.936 13.192 197.976 12.776 198.744 12.008L198.168 11.224C197.56 11.848 196.664 12.2 195.784 12.2C194.12 12.2 193.096 10.984 193 9.528H199.256V9.224C199.256 6.904 197.88 5.08 195.544 5.08C193.336 5.08 191.736 6.888 191.736 9.128ZM195.528 6.072C197.288 6.072 198.056 7.496 198.072 8.648H193C193.064 7.464 193.88 6.072 195.528 6.072Z"
                            fill="#110848"
                        />
                        <path
                            d="M212 6L216 10L220 6"
                            stroke="#110848"
                            stroke-width="1.5"
                            stroke-linecap="square"
                        />
                        <path
                            d="M269.248 13H272.896C276.208 13 278.368 10.712 278.368 7.672C278.368 4.648 276.208 2.328 272.896 2.328H269.248V13ZM270.576 11.816V3.512H272.896C275.536 3.512 276.992 5.368 276.992 7.672C276.992 9.96 275.488 11.816 272.896 11.816H270.576ZM285.875 13H287.075V7.688C287.075 5.816 285.715 5.08 284.083 5.08C282.819 5.08 281.827 5.496 280.995 6.36L281.555 7.192C282.243 6.456 282.995 6.12 283.923 6.12C285.043 6.12 285.875 6.712 285.875 7.752V9.144C285.251 8.424 284.371 8.088 283.315 8.088C282.003 8.088 280.611 8.904 280.611 10.632C280.611 12.312 282.003 13.192 283.315 13.192C284.355 13.192 285.235 12.824 285.875 12.12V13ZM285.875 11.368C285.411 12.008 284.595 12.328 283.747 12.328C282.627 12.328 281.843 11.624 281.843 10.648C281.843 9.656 282.627 8.952 283.747 8.952C284.595 8.952 285.411 9.272 285.875 9.912V11.368ZM292.073 13.192C292.777 13.192 293.209 12.984 293.513 12.696L293.161 11.8C293.001 11.976 292.681 12.12 292.345 12.12C291.817 12.12 291.561 11.704 291.561 11.128V6.328H293.129V5.272H291.561V3.16H290.361V5.272H289.081V6.328H290.361V11.384C290.361 12.536 290.937 13.192 292.073 13.192ZM300.296 13H301.496V7.688C301.496 5.816 300.136 5.08 298.504 5.08C297.24 5.08 296.248 5.496 295.416 6.36L295.976 7.192C296.664 6.456 297.416 6.12 298.344 6.12C299.464 6.12 300.296 6.712 300.296 7.752V9.144C299.672 8.424 298.792 8.088 297.736 8.088C296.424 8.088 295.032 8.904 295.032 10.632C295.032 12.312 296.424 13.192 297.736 13.192C298.776 13.192 299.656 12.824 300.296 12.12V13ZM300.296 11.368C299.832 12.008 299.016 12.328 298.168 12.328C297.048 12.328 296.264 11.624 296.264 10.648C296.264 9.656 297.048 8.952 298.168 8.952C299.016 8.952 299.832 9.272 300.296 9.912V11.368ZM314.138 13H315.338V7.688C315.338 5.816 313.978 5.08 312.346 5.08C311.082 5.08 310.09 5.496 309.258 6.36L309.818 7.192C310.506 6.456 311.258 6.12 312.186 6.12C313.306 6.12 314.138 6.712 314.138 7.752V9.144C313.514 8.424 312.634 8.088 311.578 8.088C310.266 8.088 308.874 8.904 308.874 10.632C308.874 12.312 310.266 13.192 311.578 13.192C312.618 13.192 313.498 12.824 314.138 12.12V13ZM314.138 11.368C313.674 12.008 312.858 12.328 312.01 12.328C310.89 12.328 310.106 11.624 310.106 10.648C310.106 9.656 310.89 8.952 312.01 8.952C312.858 8.952 313.674 9.272 314.138 9.912V11.368ZM323.6 13H324.8V7.576C324.8 5.896 323.952 5.08 322.336 5.08C321.184 5.08 320.128 5.752 319.584 6.392V5.272H318.384V13H319.584V7.352C320.032 6.728 320.928 6.152 321.872 6.152C322.912 6.152 323.6 6.584 323.6 7.944V13ZM333.436 13H334.636V2.328H333.436V6.44C332.812 5.592 331.868 5.08 330.828 5.08C328.796 5.08 327.388 6.68 327.388 9.144C327.388 11.656 328.812 13.192 330.828 13.192C331.916 13.192 332.86 12.632 333.436 11.848V13ZM333.436 10.904C333.004 11.576 332.076 12.12 331.116 12.12C329.564 12.12 328.636 10.856 328.636 9.144C328.636 7.432 329.564 6.152 331.116 6.152C332.076 6.152 333.004 6.728 333.436 7.4V10.904ZM343.036 4.024C343.484 4.024 343.852 3.672 343.852 3.224C343.852 2.776 343.484 2.408 343.036 2.408C342.604 2.408 342.236 2.776 342.236 3.224C342.236 3.672 342.604 4.024 343.036 4.024ZM342.444 13H343.644V5.272H342.444V13ZM351.894 13H353.094V7.576C353.094 5.896 352.246 5.08 350.63 5.08C349.478 5.08 348.422 5.752 347.878 6.392V5.272H346.678V13H347.878V7.352C348.326 6.728 349.222 6.152 350.166 6.152C351.206 6.152 351.894 6.584 351.894 7.944V13ZM361.731 13H362.931V2.328H361.731V6.44C361.107 5.592 360.163 5.08 359.123 5.08C357.091 5.08 355.683 6.68 355.683 9.144C355.683 11.656 357.107 13.192 359.123 13.192C360.211 13.192 361.155 12.632 361.731 11.848V13ZM361.731 10.904C361.299 11.576 360.371 12.12 359.411 12.12C357.859 12.12 356.931 10.856 356.931 9.144C356.931 7.432 357.859 6.152 359.411 6.152C360.371 6.152 361.299 6.728 361.731 7.4V10.904ZM366.566 4.024C367.014 4.024 367.382 3.672 367.382 3.224C367.382 2.776 367.014 2.408 366.566 2.408C366.134 2.408 365.766 2.776 365.766 3.224C365.766 3.672 366.134 4.024 366.566 4.024ZM365.974 13H367.174V5.272H365.974V13ZM369.759 9.128C369.759 11.432 371.311 13.192 373.615 13.192C375.023 13.192 375.856 12.616 376.448 11.848L375.648 11.112C375.135 11.8 374.479 12.12 373.68 12.12C372.031 12.12 371.007 10.84 371.007 9.128C371.007 7.416 372.031 6.152 373.68 6.152C374.479 6.152 375.135 6.456 375.648 7.16L376.448 6.424C375.856 5.656 375.023 5.08 373.615 5.08C371.311 5.08 369.759 6.84 369.759 9.128ZM383.601 13H384.801V7.688C384.801 5.816 383.441 5.08 381.809 5.08C380.545 5.08 379.553 5.496 378.721 6.36L379.281 7.192C379.969 6.456 380.721 6.12 381.649 6.12C382.769 6.12 383.601 6.712 383.601 7.752V9.144C382.977 8.424 382.097 8.088 381.041 8.088C379.729 8.088 378.337 8.904 378.337 10.632C378.337 12.312 379.729 13.192 381.041 13.192C382.081 13.192 382.961 12.824 383.601 12.12V13ZM383.601 11.368C383.137 12.008 382.321 12.328 381.473 12.328C380.353 12.328 379.569 11.624 379.569 10.648C379.569 9.656 380.353 8.952 381.473 8.952C382.321 8.952 383.137 9.272 383.601 9.912V11.368ZM389.799 13.192C390.503 13.192 390.935 12.984 391.239 12.696L390.887 11.8C390.727 11.976 390.407 12.12 390.071 12.12C389.543 12.12 389.287 11.704 389.287 11.128V6.328H390.855V5.272H389.287V3.16H388.087V5.272H386.807V6.328H388.087V11.384C388.087 12.536 388.663 13.192 389.799 13.192ZM396.566 13.192C398.918 13.192 400.39 11.368 400.39 9.128C400.39 6.888 398.918 5.08 396.566 5.08C394.214 5.08 392.742 6.888 392.742 9.128C392.742 11.368 394.214 13.192 396.566 13.192ZM396.566 12.12C394.918 12.12 393.99 10.712 393.99 9.128C393.99 7.56 394.918 6.152 396.566 6.152C398.214 6.152 399.126 7.56 399.126 9.128C399.126 10.712 398.214 12.12 396.566 12.12ZM402.986 13H404.186V7.528C404.538 6.904 405.546 6.296 406.282 6.296C406.474 6.296 406.618 6.312 406.762 6.344V5.112C405.706 5.112 404.81 5.704 404.186 6.52V5.272H402.986V13ZM408.236 11.976C409.02 12.808 410.092 13.192 411.356 13.192C413.356 13.192 414.396 12.152 414.396 10.856C414.396 9.144 412.844 8.76 411.5 8.456C410.492 8.216 409.612 7.976 409.612 7.224C409.612 6.536 410.268 6.056 411.324 6.056C412.316 6.056 413.164 6.472 413.628 7.032L414.188 6.2C413.564 5.576 412.636 5.08 411.324 5.08C409.484 5.08 408.444 6.104 408.444 7.304C408.444 8.904 409.932 9.256 411.244 9.56C412.284 9.816 413.228 10.088 413.228 10.936C413.228 11.688 412.588 12.216 411.404 12.216C410.348 12.216 409.372 11.704 408.86 11.112L408.236 11.976Z"
                            fill="#110848"
                        />
                        <g clip-path="url(#clip0)">
                            <path
                                d="M479.891 14.6531L476.097 10.8594C476.025 10.7875 475.931 10.75 475.831 10.75H475.419C476.403 9.60938 477 8.125 477 6.5C477 2.90937 474.091 0 470.5 0C466.909 0 464 2.90937 464 6.5C464 10.0906 466.909 13 470.5 13C472.125 13 473.609 12.4031 474.75 11.4187V11.8313C474.75 11.9313 474.791 12.025 474.859 12.0969L478.653 15.8906C478.8 16.0375 479.037 16.0375 479.184 15.8906L479.891 15.1844C480.038 15.0375 480.038 14.8 479.891 14.6531ZM470.5 11.5C467.737 11.5 465.5 9.2625 465.5 6.5C465.5 3.7375 467.737 1.5 470.5 1.5C473.262 1.5 475.5 3.7375 475.5 6.5C475.5 9.2625 473.262 11.5 470.5 11.5Z"
                                fill="#110848"
                                fill-opacity="0.25"
                            />
                        </g>
                        <defs>
                            <clipPath id="clip0">
                                <rect
                                    width="16"
                                    height="16"
                                    fill="white"
                                    transform="translate(464)"
                                />
                            </clipPath>
                        </defs>
                    </svg>
                </div>
            </div>
        </header>
    );
};

export default Header;
