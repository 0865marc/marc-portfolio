const heading=document.querySelector<HTMLElement>('[data-route-heading]')
const focusRoute=()=>{if(heading&&!location.hash){heading.focus({preventScroll:true});setTimeout(()=>heading.focus({preventScroll:true}),250)}}
focusRoute()
addEventListener('pageshow',focusRoute,{once:true})
addEventListener('pagereveal',focusRoute,{once:true})
const back=document.querySelector<HTMLAnchorElement>('[data-article-back]')
if(back && new URLSearchParams(location.search).get('from')==='landing'){back.href='/#blog';back.textContent='Volver al Blog del portfolio'}
const focusHash=()=>{const id=location.hash.slice(1);if(!id||id.startsWith('/'))return;const target=document.getElementById(id);const associated=target?.matches('h1,h2,h3,h4,h5,h6')?target:target?.querySelector<HTMLElement>('h1,h2,h3,h4,h5,h6');target?.scrollIntoView();associated?.focus({preventScroll:true})}
addEventListener('hashchange',focusHash)
if(location.hash) requestAnimationFrame(focusHash)
