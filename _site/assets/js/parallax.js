document.addEventListener('DOMContentLoaded', () => {
  const specialtiesLines = document.querySelectorAll('.specialties-line');
  let scrollPosition = window.scrollY;
  let ticking = false;

  function updateParallax() {
    const viewportHeight = window.innerHeight;
    const specialtiesSection = document.querySelector('.specialties');
    const sectionRect = specialtiesSection.getBoundingClientRect();
    
    // Calcula a posição relativa da seção na viewport
    const sectionCenter = sectionRect.top + sectionRect.height / 2;
    const viewportCenter = viewportHeight / 2;
    
    // Calcula a distância do centro da seção até o centro da viewport
    const distanceFromCenter = sectionCenter - viewportCenter;
    
    // Normaliza a distância para um valor entre -1 e 1
    const normalizedDistance = Math.max(-1, Math.min(1, distanceFromCenter / (viewportHeight / 2)));
    
    specialtiesLines.forEach((line, index) => {
      const direction = index % 2 === 0 ? 1 : -1;
      const position = 100 * direction * normalizedDistance;
      const content = line.querySelector('.specialties-content');
      
      // Calcula a opacidade baseada na proximidade do centro
      const opacity = 1 - Math.abs(normalizedDistance);
      content.style.transform = `translateX(${position}%)`;
      
      // Adiciona ou remove a classe active baseado na proximidade do centro
      if (Math.abs(normalizedDistance) < 0.5) {
        content.classList.add('active');
        content.style.opacity = opacity;
      } else {
        content.classList.remove('active');
        content.style.opacity = 0.1;
      }
    });
    
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    scrollPosition = window.scrollY;
    
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateParallax();
        ticking = false;
      });
      ticking = true;
    }
  });

  // Inicializa a posição
  updateParallax();
}); 