const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches
const broken=(img:HTMLImageElement)=>{img.style.opacity='0';img.dataset.failed='true'}
document.querySelectorAll<HTMLImageElement>('[data-image-fallback]').forEach(img=>{img.addEventListener('error',()=>broken(img),{once:true});if(img.complete&&!img.naturalWidth)broken(img)})
if(!reduced&&'IntersectionObserver'in window){const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('revealed');io.unobserve(e.target)}}),{rootMargin:'0px 0px -8%'});document.querySelectorAll('[data-reveal]').forEach(el=>io.observe(el))}else document.querySelectorAll('[data-reveal]').forEach(el=>el.classList.add('revealed'))
