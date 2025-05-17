
ocument.addEventListener('DOMContentLoaded', async () => {
    const currentTab = localStorage.getItem('searchTab') || 'web';
    document.querySelectorAll('.tab-btn').forEach(btn => {
        if (btn.dataset.type === currentTab) btn.classList.add('active');
        
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            localStorage.setItem('searchTab', btn.dataset.type);
            
            if (btn.dataset.type === 'images') {
                renderImageResults(filtered);
            } else if (btn.dataset.type !== 'web') {
                resultsContainer.innerHTML = '<div class="coming-soon">Cette fonctionnalité sera bientôt disponible</div>';
            } else {
                renderWebResults(filtered);
            }
        });
    });

    const params = new URLSearchParams(window.location.search);
    const query = params.get('q') || '';
    const page = parseInt(params.get('page')) || 1;
    const resultsPerPage = 50; // Modification: 50 résultats par page
    const resultsContainer = document.getElementById('results');
    const loader = document.getElementById('loader');
    const searchInput = document.getElementById('searchInput');

    if (searchInput) {
        searchInput.value = query;
        document.getElementById('searchForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const searchQuery = searchInput.value.trim();
            if (searchQuery) {
                window.location.href = `/search.html?q=${encodeURIComponent(searchQuery)}`;
            }
        });
    }

    loader.style.display = 'block';

    // Récupération des résultats (simulation de fetch local)
    let data = [];
    try {
        const res = await fetch('/searchData.json');
        data = await res.json();
    } catch (e) {
        loader.style.display = 'none';
        if (resultsContainer) {
            resultsContainer.innerHTML = '<div style="color:red">Erreur lors du chargement des résultats.</div>';
        } else {
            alert('Erreur lors du chargement des résultats.');
        }
        return;
    }

    // Ajouter les fonctions de sécurité
    const securityChecks = {
        isDarkWebDomain: (url) => {
            const darkwebPatterns = ['.onion', '.i2p', 'darknet', 'hidden'];
            return darkwebPatterns.some(pattern => url.toLowerCase().includes(pattern));
        },
        isSuspiciousDomain: (url) => {
            const suspiciousPatterns = [
                'scam', 'phishing', 'hack', 'crack', 'warez', 
                'malware', 'trojan', 'botnet', 'exploit'
            ];
            return suspiciousPatterns.some(pattern => url.toLowerCase().includes(pattern));
        },
        hasUnsafeContent: (content) => {
            const unsafePatterns = [
                'password stealer', 'credit card', 'bank account',
                'social security', 'identity theft'
            ];
            return unsafePatterns.some(pattern => 
                content.toLowerCase().includes(pattern)
            );
        },
        isSecureUrl: (url) => {
            try {
                const urlObj = new URL(url);
                return urlObj.protocol === 'https:';
            } catch {
                return false;
            }
        }
    };

    // Recherche simple (insensible à la casse dans titre/desc/contenu)
    const q = query.trim().toLowerCase();
    const filtered = data.filter(item => {
        // Vérifications de sécurité
        if (securityChecks.isDarkWebDomain(item.url) || 
            securityChecks.isSuspiciousDomain(item.url) ||
            securityChecks.hasUnsafeContent(item.content || '') ||
            !securityChecks.isSecureUrl(item.url)) {
            return false;
        }

        return item.title?.toLowerCase().includes(q) ||
               item.description?.toLowerCase().includes(q) ||
               item.content?.toLowerCase().includes(q);
    });

    // Pagination des résultats
    const start = (page - 1) * resultsPerPage;
    const paginatedResults = filtered.slice(start, start + resultsPerPage);
    const totalPages = Math.ceil(filtered.length / resultsPerPage);

    // Simplifier la fonction renderPagination
    const renderPagination = () => {
        const paginationDiv = document.createElement('div');
        paginationDiv.className = 'pagination-container';

        const resultCount = document.createElement('div');
        resultCount.className = 'result-count';
        resultCount.textContent = `${filtered.length} résultats - Page ${page} sur ${totalPages}`;
        paginationDiv.appendChild(resultCount);

        const paginationNav = document.createElement('div');
        paginationNav.className = 'pagination';

        // Bouton précédent
        if (page > 1) {
            const prevBtn = document.createElement('a');
            prevBtn.href = `/search.html?q=${encodeURIComponent(query)}&page=${page - 1}`;
            prevBtn.className = 'page-btn';
            prevBtn.innerHTML = '&larr;';
            paginationNav.appendChild(prevBtn);
        }

        // Pages
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= page - 2 && i <= page + 2)) {
                const pageBtn = document.createElement('a');
                pageBtn.href = `/search.html?q=${encodeURIComponent(query)}&page=${i}`;
                pageBtn.className = `page-btn ${i === page ? 'active' : ''}`;
                pageBtn.textContent = i;
                paginationNav.appendChild(pageBtn);
            } else if (i === page - 3 || i === page + 3) {
                const dots = document.createElement('span');
                dots.className = 'pagination-ellipsis';
                dots.textContent = '...';
                paginationNav.appendChild(dots);
            }
        }

        // Bouton suivant
        if (page < totalPages) {
            const nextBtn = document.createElement('a');
            nextBtn.href = `/search.html?q=${encodeURIComponent(query)}&page=${page + 1}`;
            nextBtn.className = 'page-btn';
            nextBtn.innerHTML = '&rarr;';
            paginationNav.appendChild(nextBtn);
        }

        paginationDiv.appendChild(paginationNav);
        resultsContainer.appendChild(paginationDiv);
    };

    loader.style.display = 'none';

    if (!filtered.length) {
        resultsContainer.innerHTML = '<div style="padding:2rem;text-align:center;color:#888;font-size:1.2rem;">Aucun résultat trouvé.</div>';
        return;
    }

    // Afficher les résultats initiaux selon l'onglet actif
    if (currentTab === 'images') {
        renderImageResults(filtered);
    } else {
        renderWebResults(filtered);
    }

    function renderImageResults(results) {
        resultsContainer.innerHTML = '';
        
        const imageGrid = document.createElement('div');
        imageGrid.className = 'image-results';
        
        const imageResults = results.filter(item => item.image);
        
        if (!imageResults.length) {
            resultsContainer.innerHTML = '<div style="text-align:center;padding:2rem;">Aucune image trouvée</div>';
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'image-modal';
        modal.innerHTML = `
            <button class="modal-close" aria-label="Fermer"></button>
            <nav class="search-tabs modal-tabs">
                <button class="tab-btn" data-filter="all">
                    <svg class="tab-icon" viewBox="0 0 24 24">
                        <path d="M4 5h16v14H4V5zm2 2v10h12V7H6z"/>
                    </svg>
                    Tous
                </button>
                <button class="tab-btn" data-filter="similar">
                    <svg class="tab-icon" viewBox="0 0 24 24">
                        <path d="M4 5h16v14H4V5zm2 2v10h12V7H6zm8 6l-3 3H7l5-5 4 4v1h2l-4-4z"/>
                    </svg>
                    Similaires
                </button>
            </nav>
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title"></h3>
                </div>
                <div class="modal-image-container">
                    <img class="modal-image" src="" alt="">
                </div>
                <div class="similar-images"></div>
            </div>
        `;
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        
        document.body.appendChild(modal);
        document.body.appendChild(overlay);

        // Gestionnaires d'événements de la modal
        const closeModal = () => {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        };

        modal.querySelector('.modal-close').onclick = closeModal;
        overlay.onclick = closeModal;

        // Mise à jour de l'ouverture de la modal
        const openModal = (item, idx) => {
            const modalImg = modal.querySelector('.modal-image');
            const modalTitle = modal.querySelector('.modal-title');
            
            modalImg.src = item.image;
            modalImg.alt = item.title;
            modalTitle.textContent = item.title;
            
            // Animation des images similaires
            const similarImages = imageResults
                .filter(img => img !== item)
                .sort(() => 0.5 - Math.random())
                .slice(0, 6);

            const similarContainer = modal.querySelector('.similar-images');
            similarContainer.innerHTML = similarImages
                .map((img, i) => `
                    <div class="similar-image" style="animation-delay: ${i * 0.1}s">
                        <img src="${img.image}" alt="${img.title}" loading="lazy">
                    </div>
                `).join('');

            similarContainer.querySelectorAll('.similar-image').forEach((simImg, i) => {
                simImg.onclick = (e) => {
                    e.stopPropagation();
                    openModal(similarImages[i], i);
                };
            });

            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        };

        imageResults.forEach((item, idx) => {
            const div = document.createElement('div');
            div.className = 'image-item';
            div.innerHTML = `
                <img src="${item.image}" alt="${item.title}" loading="lazy">
                <div class="image-info">
                    <div>${item.title}</div>
                    <small>${item.url}</small>
                </div>
            `;

            div.onclick = () => openModal(item, idx);

            setTimeout(() => imageGrid.appendChild(div), idx * 50);
        });

        resultsContainer.appendChild(imageGrid);
    }

    function renderWebResults(filtered) {
        const resultsWrapper = document.createElement('div');
        resultsWrapper.className = 'results-wrapper';
        
        paginatedResults.forEach((item, idx) => {
            const div = document.createElement('div');
            div.className = 'result-item';
            div.style.animationDelay = (idx * 0.06) + 's';

            // Image principale
            let imgHtml = '';
            if (item.image) {
                imgHtml = `<img class="result-image" src="${item.image}" alt="Image" loading="lazy" onerror="this.hidden=true">`;
            }

            // Catégories
            let catHtml = '';
            if (item.categories && item.categories.length) {
                catHtml = `<div class="result-categories">${item.categories.map(cat =>
                    `<span class="result-chip">${cat}</span>`
                ).join('')}</div>`;
            }

            div.innerHTML = `
                ${imgHtml}
                <div class="result-content">
                    <a class="result-title" href="${item.url}" target="_blank" rel="noopener">${item.title}</a>
                    <span class="result-url">${item.url}</span>
                    <div class="result-desc">${item.description || ''}</div>
                    ${catHtml}
                </div>
            `;
            setTimeout(() => resultsWrapper.appendChild(div), idx * 60);
        });

        resultsContainer.innerHTML = '';
        resultsContainer.appendChild(resultsWrapper);
        renderPagination();
    }
});
