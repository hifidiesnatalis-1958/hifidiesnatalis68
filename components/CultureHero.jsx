'use client';

import {memo} from 'react';
import artwork from '@/public/assets/kasundaan/manifest.json';
import Icon from './Icon.jsx';

const assets = Object.fromEntries(artwork.assets.map(asset => [asset.name, asset]));
function SourceArt({name, alt = '', className = '', ...props}) {
  const asset = assets[name];
  return <img src={asset.src} width={asset.width} height={asset.height} alt={alt}
    className={className} decoding="async" {...props}/>;
}

// Scroll progress belongs to the browser's CSS view timeline. React never
// rerenders the page for scroll position, and there is no wheel/scroll hijack.
function CultureHero({theme}) {
  return <section id="beranda" className="hero culture-hero" aria-labelledby="festival-title">
    <div className="hero-stage" data-morph-stage>
      <div className="hero-surface" aria-hidden="true"/>
      <div className="hero-collage" aria-hidden="true">
        <div className="collage-batik"/>
        <SourceArt name="gunungan-blue" className="collage-gunungan"/>
        <SourceArt name="wayang-arjuna" className="collage-wayang arjuna"/>
        <SourceArt name="wayang-semar" className="collage-wayang semar"/>
        <SourceArt name="cloud-red" className="collage-cloud cloud-one"/>
        <SourceArt name="cloud-red-wide" className="collage-cloud cloud-two"/>
        <SourceArt name="corner-bottom-left" className="collage-flower flower-one"/>
        <SourceArt name="corner-bottom-right" className="collage-flower flower-two"/>
      </div>
      <div className="hero-emblem-motion" aria-hidden="true">
        <SourceArt name="logo-68" className="hero-emblem" fetchPriority="high"/>
      </div>
      <div className="hero-main wrap">
        <div className="hero-copy">
          <SourceArt name="wordmark-dies-hifi" className="hero-wordmark"/>
          <h1 id="festival-title"><span className="sr-only">Dies Natalis HIFI ke-68. </span>Wilujeng<br/><span>sumping.</span></h1>
          <p className="hero-description">Mari berkumpul, keluarga HIFI.<br/>Rayakan 68 tahun kebersamaan dalam budaya Sunda.</p>
          <div className="hero-actions"><a className="button" href="#rangkaian">Jelajahi perayaan<Icon name="arrow" size={18}/></a><a className="text-link" href="#menfess">Titip Harewos<Icon name="send" size={17}/></a></div>
        </div>
        <div className="hero-story-end" aria-hidden="true">
          <p className="hero-end-label">Dies Natalis HIFI FMIPA UNPAD ke-68</p>
          <h2>{theme.title}<br/><span>di tengah keluarga HIFI.</span></h2>
          <SourceArt name="flourish-gold"/>
        </div>
      </div>
    </div>
  </section>;
}

export default memo(CultureHero);
