import React from 'react';
import { useNavigate } from 'react-router-dom';
import './NotFound.css';

import Bg404 from '../../assets/images/404-bg.jpg';
import Obj404 from '../../assets/images/404-obj.png';
import Text404 from '../../assets/images/404-text.png';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="not-found-wrapper">
            <div 
                className="block404" 
                style={{ backgroundImage: `url(${Bg404})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                onClick={() => navigate('/home')}
            >
                {/* Dalga Efekti */}
                <div 
                    className="waves" 
                    style={{ backgroundImage: `url(${Bg404})` }}
                ></div>
                
                {/* Hareket Eden Obje */}
                <div className="obj">
                    <img src={Obj404} alt="404 Obj" />
                </div>

                {/* 404 Yazı Görseli */}
                <div 
                    className="t404" 
                    style={{ backgroundImage: `url(${Text404})` }}
                ></div>

                <svg xmlns="http://www.w3.org/2000/svg" version="1.1" style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}>
                    <defs>
                        <filter id="glitch">
                            <feTurbulence 
                                type="fractalNoise" 
                                baseFrequency="0.01 0.03" 
                                numOctaves="1" 
                                result="warp" 
                            />
                            <feColorMatrix in="warp" result="huedturb" type="hueRotate" values="90">
                                <animate 
                                    attributeName="values" 
                                    values="0;180;360" 
                                    dur="3s" 
                                    repeatCount="indefinite"
                                />
                            </feColorMatrix>
                            <feDisplacementMap 
                                xChannelSelector="R" 
                                yChannelSelector="G" 
                                scale="50" 
                                in="SourceGraphic" 
                                in2="huedturb"
                            />
                        </filter>
                    </defs>
                </svg>
            </div>
            
            <div className="not-found-content">
                <h2>ARADIĞIN SAYFA TATİLE ÇIKTI</h2>
                <button className="back-home-btn" onClick={() => navigate('/home')}>
                    ANASAYFAYA GERİ DÖN
                </button>
            </div>
        </div>
    );
};

export default NotFound;