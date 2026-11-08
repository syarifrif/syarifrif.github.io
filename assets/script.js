/* Website Syarif — JavaScript murni, dapat dibuka langsung melalui index.html. */
(() => {
  'use strict';
  const data = window.SYARIF_CONTENT;
  if (!data) return;
  const {profile, projects, journey, notes, photoAlbums} = data;
  const $ = (selector) => document.querySelector(selector);
  const all = (selector) => Array.from(document.querySelectorAll(selector));
  const escape = (value) => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safeURL = (value, image = false) => {
    const s = String(value || '').trim();
    if (/^https?:\/\//i.test(s)) return s;
    if (image && s && !/^[a-z][a-z0-9+.-]*:/i.test(s) && !s.startsWith('//')) return s.replace(/^\//, '');
    return '';
  };
  const icons = {
    arrow: $('.round-arrow').innerHTML,
    right: $('.hero-actions .text-link svg').outerHTML,
    close: $('.dialog-close').innerHTML,
    menu: $('.menu-toggle').innerHTML,
    camera: $('.album-row:nth-child(2) .album-icon').innerHTML,
    mountain: $('.album-row .album-icon').innerHTML,
    chevron: $('.album-row > svg').outerHTML,
    book: $('.strip-inner > div > span:nth-of-type(2) svg').outerHTML,
  };
  const visuals = {
    rfid: $('.rfid-visual').outerHTML,
    kkn: $('.web-visual').outerHTML,
    hydro: $('.hydro-visual').outerHTML,
  };
  const tags = (items) => '<div class="tags">'+items.map(t=>'<span>'+escape(t)+'</span>').join('')+'</div>';
  const paragraphs = (items) => items.map(p=>'<p>'+escape(p)+'</p>').join('');
  const dialog = $('.detail-dialog');
  let previousFocus = null;
  let previousOverflow = '';

  function closeDialog() { dialog.close(); }
  function openDialog(content, photo = false) {
    if (dialog.open) dialog.close();
    previousFocus = document.activeElement;
    previousOverflow = document.body.style.overflow;
    dialog.className = photo ? 'detail-dialog photo-dialog' : 'detail-dialog';
    dialog.innerHTML = '<div class="dialog-inner"><button class="dialog-close icon-button" data-close aria-label="Tutup detail">'+icons.close+'</button>'+content+'</div>';
    dialog.showModal();
    document.body.style.overflow = 'hidden';
  }
  dialog.addEventListener('click', e => {if(e.target === dialog || e.target.closest('[data-close]')) closeDialog();});
  dialog.addEventListener('close', () => {document.body.style.overflow = previousOverflow;previousFocus?.focus({preventScroll:true});});

  document.title = profile.name+' — Teknologi, Cerita & Perjalanan';
  $('.hero-description').textContent = profile.introduction;
  $('.hero-greeting').innerHTML = 'Halo, saya '+escape(profile.nickname)+' <span class="greeting-asterisk">✳</span>';
  $('.hero-meta > span:first-child').innerHTML = $('.hero-meta svg').outerHTML+escape(profile.location);
  $('.education-note p').innerHTML = escape(profile.education)+'<br><strong>'+escape(profile.university)+'</strong>';
  const about = $('.about-copy');
  all('.about-copy > p').forEach(p => p.remove());
  about.insertAdjacentHTML('afterbegin', paragraphs(profile.bio));
  $('.skills > div').innerHTML = profile.skills.map(s=>'<span>'+escape(s)+'</span>').join('');
  $('.journey').innerHTML = journey.map((j,i)=>'<article><div class="journey-top"><span class="timeline-dot'+(i===journey.length-1?' current':'')+'"></span><span>'+escape(j.year)+'</span></div><h4>'+escape(j.title)+'</h4><p>'+escape(j.text)+'</p></article>').join('');
  $('.site-footer > p').textContent = '© '+new Date().getFullYear()+' '+profile.name;

  // Generate all cards from the editable content file.
  $('.projects-grid').innerHTML = projects.map(p=>'<button class="project-card" data-project="'+escape(p.id)+'" data-category="'+escape(p.category)+'" aria-label="Lihat detail '+escape(p.title)+'">'+(visuals[p.id] || visuals.hydro)+'<div class="project-info"><div class="project-meta"><span>'+escape(p.category)+'</span><span>'+escape(p.status)+'</span></div><div class="project-title"><h3>'+escape(p.title)+'</h3><span class="round-arrow">'+icons.arrow+'</span></div><p>'+escape(p.description)+'</p>'+tags(p.tags)+'</div></button>').join('');
  $('.note-list').innerHTML = notes.map((n,i)=>'<button class="note-row" data-note="'+escape(n.id)+'"><span class="note-number">'+String(i+1).padStart(2,'0')+'</span><span class="note-main"><span class="note-category">'+escape(n.category)+'<i></i>DRAF</span><h3>'+escape(n.title)+'</h3><span class="note-excerpt">'+escape(n.excerpt)+'</span></span><span class="reading-time">'+escape(n.readTime)+' baca</span>'+icons.arrow+'</button>').join('');
  $('.album-list').innerHTML = photoAlbums.map(a=>'<button class="album-row" data-album="'+escape(a.id)+'"><span class="album-icon">'+(a.id==='alam'?icons.mountain:icons.camera)+'</span><span><strong>'+escape(a.title)+'</strong><small>'+(a.photos.length?a.photos.length+' foto':'Menunggu cerita pertama')+'</small></span>'+icons.chevron+'</button>').join('');

  all('.filters button').forEach(button => button.addEventListener('click', () => {
    all('.filters button').forEach(b => {const on=b===button;b.classList.toggle('selected',on);b.setAttribute('aria-pressed',String(on));});
    const filter=button.textContent.trim();
    all('.project-card').forEach(card => {card.hidden=!(filter==='Semua'||(filter==='Web'?card.dataset.category==='Web':card.dataset.category!=='Web'));});
  }));

  $('.projects-grid').addEventListener('click', e => {
    const card=e.target.closest('[data-project]');if(!card)return;
    const p=projects.find(p=>p.id===card.dataset.project);if(!p)return;
    openDialog((visuals[p.id] || visuals.hydro)+'<div class="dialog-content"><span class="eyebrow">PROYEK '+escape(p.number)+' / '+escape(p.category)+'</span><h2 id="dialog-title">'+escape(p.title)+'</h2><span class="status-label"><span class="green-dot"></span>'+escape(p.status)+'</span>'+paragraphs(p.story)+'<h3>Ruang eksplorasi</h3><ul class="project-steps">'+p.steps.map(s=>'<li>'+icons.right+escape(s)+'</li>').join('')+'</ul>'+tags(p.tags)+'</div>');
  });
  $('.note-list').addEventListener('click', e => {
    const row=e.target.closest('[data-note]');if(!row)return;
    const n=notes.find(n=>n.id===row.dataset.note);if(!n)return;
    openDialog('<article class="dialog-content article-content"><span class="eyebrow">'+escape(n.category)+' / '+escape(n.readTime)+' BACA</span><h2 id="dialog-title">'+escape(n.title)+'</h2><div class="draft-banner">'+icons.book+'<span>Draf contoh · Belum dipublikasikan sebagai tulisan pribadi.</span></div>'+paragraphs(n.body)+'<span class="article-signature">Ruang catatan '+escape(profile.nickname)+'.</span></article>');
  });
  $('.album-list').addEventListener('click', e => {
    const row=e.target.closest('[data-album]');if(!row)return;
    const a=photoAlbums.find(a=>a.id===row.dataset.album);if(!a)return;
    const gallery=a.photos.length?'<div class="album-photos">'+a.photos.map(p=>'<figure><img src="'+escape(safeURL(p.src,true))+'" alt="'+escape(p.alt)+'" loading="lazy"><figcaption>'+escape(p.caption)+'</figcaption></figure>').join('')+'</div>':'<div class="empty-album">'+icons.camera+'<h3>Halaman pertama masih terbuka.</h3><p>Belum ada foto pribadi dalam album ini.<br>Cerita dan dokumentasi akan hadir di sini.</p></div>';
    openDialog('<div class="dialog-content album-content"><span class="eyebrow">ALBUM PERJALANAN</span><h2 id="dialog-title">'+escape(a.title)+'</h2><p>'+escape(a.subtitle)+'</p>'+gallery+'</div>');
  });
  $('.gallery-image').addEventListener('click', () => openDialog('<div class="lightbox-content"><img src="assets/images/mountains.webp" alt="Ilustrasi lanskap pegunungan"><p id="dialog-title">Visual ilustrasi pegunungan — inspirasi untuk ruang perjalanan. Foto pribadi akan ditambahkan kemudian.</p></div>',true));

  const menu=$('.menu-toggle'), navigation=$('.navigation');
  function setMenu(open){navigation.classList.toggle('open',open);menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Tutup navigasi':'Buka navigasi');menu.innerHTML=open?icons.close:icons.menu;}
  menu.addEventListener('click',()=>setMenu(menu.getAttribute('aria-expanded')!=='true'));
  all('.navigation a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')setMenu(false);});
  const media=window.matchMedia('(min-width:621px)');
  media.addEventListener('change',e=>{if(e.matches)setMenu(false);});
  if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)all('.navigation a').forEach(a=>a.classList.toggle('active',a.hash==='#'+entry.target.id));}),{rootMargin:'-15% 0px -60% 0px'});['tentang','proyek','catatan','galeri'].forEach(id=>observer.observe(document.getElementById(id)));}

  $('.download-link').addEventListener('click',()=>{
    const content=[profile.name,profile.education,profile.university,profile.location,...profile.bio,'BIDANG BELAJAR',profile.skills.join(' · '),'PROYEK',...projects.map(p=>p.title+' — '+p.status+'\n'+p.description),'PERJALANAN',...journey.map(j=>j.year+': '+j.title+'. '+j.text)].join('\n\n');
    const url=URL.createObjectURL(new Blob([content],{type:'text/plain;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download='Profil-Syarif-Hidayatullah.txt';link.click();setTimeout(()=>URL.revokeObjectURL(url),5000);
  });
  const copyButton=$('.closing-actions .button.outline');
  copyButton.addEventListener('click',async()=>{
    if(location.protocol==='file:'){openDialog('<div class="dialog-content"><h2 id="dialog-title">Salin tautan setelah online</h2><p>Buka website melalui alamat GitHub Pages untuk menyalin tautan yang dapat dikunjungi orang lain.</p></div>');return;}
    const url=new URL(location.href);url.hash='';url.search='';url.pathname=url.pathname.replace(/index\.html$/,'');
    try{if(!navigator.clipboard)throw new Error('Clipboard unavailable');await navigator.clipboard.writeText(url.href);copyButton.querySelector('span').textContent='Tautan berhasil disalin';setTimeout(()=>{copyButton.querySelector('span').textContent='Salin tautan profil';},2500);}
    catch{openDialog('<div class="dialog-content"><h2 id="dialog-title">Tautan profil</h2><p>Salin alamat berikut untuk membagikan profil:</p><input class="url-input" readOnly value="'+escape(url.href)+'" aria-label="Alamat website pribadi"></div>');dialog.querySelector('input').addEventListener('focus',e=>e.target.select());}
  });

  // Optional contact details appear only when supplied in content.js.
  if(profile.email&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email))$('.closing-actions').insertAdjacentHTML('afterbegin','<a class="button primary" href="mailto:'+escape(profile.email)+'">Mari terhubung '+icons.arrow+'</a>');
  for(const [key,label] of [['instagram','Instagram'],['github','GitHub']]){const url=safeURL(profile[key]);if(url)$('.footer-links').insertAdjacentHTML('afterbegin','<a href="'+escape(url)+'" target="_blank" rel="noreferrer">'+label+' '+icons.arrow+'</a>');}
})();
