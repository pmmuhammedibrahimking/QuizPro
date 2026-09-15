/**
 * NexusPulse Main Interactive Application Logic
 */

// Sample Project / Module Dataset
const MODULES_DATA = [
    {
        id: 1,
        title: 'Neural Network Architectures',
        category: 'ai',
        categoryLabel: 'Artificial Intelligence',
        description: 'Master deep neural networks, transformer models, and vision algorithms with hands-on PyTorch modules.',
        level: 'Advanced',
        students: '1,420',
        rating: '4.9 ★'
    },
    {
        id: 2,
        title: 'Full-Stack Next.js 14 & Node',
        category: 'web',
        categoryLabel: 'Web Development',
        description: 'Build high-performance SSR applications, server actions, and API routes with TypeScript & Tailwind CSS.',
        level: 'Intermediate',
        students: '3,890',
        rating: '4.8 ★'
    },
    {
        id: 3,
        title: 'Cloud Native Microservices',
        category: 'cloud',
        categoryLabel: 'Cloud Systems',
        description: 'Deploy resilient containerized workloads using Kubernetes, Docker, and Automated GitOps CI/CD Pipelines.',
        level: 'Advanced',
        students: '2,150',
        rating: '4.9 ★'
    },
    {
        id: 4,
        title: 'Zero Trust Security Systems',
        category: 'cyber',
        categoryLabel: 'Cyber Security',
        description: 'Implement robust identity management, cryptographic protocol audits, and proactive threat detection.',
        level: 'Intermediate',
        students: '1,780',
        rating: '4.7 ★'
    },
    {
        id: 5,
        title: 'Generative AI & LLM Fine-Tuning',
        category: 'ai',
        categoryLabel: 'Artificial Intelligence',
        description: 'Learn Retrieval-Augmented Generation (RAG), vector embeddings, and fine-tuning Open-Source LLMs.',
        level: 'Expert',
        students: '4,210',
        rating: '5.0 ★'
    },
    {
        id: 6,
        title: 'Modern CSS & UI Architecture',
        category: 'web',
        categoryLabel: 'Web Development',
        description: 'Design responsive liquid layouts, glassmorphism design systems, and fluid micro-animations.',
        level: 'Beginner',
        students: '5,600',
        rating: '4.9 ★'
    }
];

// Sample Active System Activity Data
const ACTIVITY_DATA = [
    { id: 'MOD-901', name: 'LLM Fine-Tuning Benchmarks', type: 'AI Training', status: 'active', score: '99.4%', updated: '2 mins ago' },
    { id: 'MOD-882', name: 'Kubernetes Cluster Deployment', type: 'Cloud DevOps', status: 'completed', score: '100%', updated: '15 mins ago' },
    { id: 'MOD-745', name: 'OWASP Security Audit', type: 'Cyber Sec', status: 'pending', score: '88.5%', updated: '1 hr ago' },
    { id: 'MOD-612', name: 'React Server Components Test', type: 'Web Dev', status: 'completed', score: '95.2%', updated: '3 hrs ago' },
    { id: 'MOD-509', name: 'Computer Vision Model Export', type: 'AI Model', status: 'active', score: '97.8%', updated: '5 hrs ago' }
];

const AppController = {
    activeCategory: 'all',
    searchQuery: '',

    init() {
        this.renderModules();
        this.renderActivityTable();
        this.bindEvents();
        this.animateStats();
    },

    bindEvents() {
        // Category Pills Listener
        const pillBtns = document.querySelectorAll('.pill-btn');
        pillBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                pillBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.activeCategory = e.target.getAttribute('data-category');
                this.renderModules();
            });
        });

        // Search Input Listener
        const searchInput = document.getElementById('moduleSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.toLowerCase().trim();
                this.renderModules();
            });
        }

        // Modal Close Listeners
        const modalOverlay = document.getElementById('modalOverlay');
        const modalCloseBtn = document.getElementById('modalCloseBtn');
        if (modalCloseBtn) {
            modalCloseBtn.addEventListener('click', () => this.closeModal());
        }
        if (modalOverlay) {
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) this.closeModal();
            });
        }
    },

    getFilteredModules() {
        return MODULES_DATA.filter(mod => {
            const matchesCategory = this.activeCategory === 'all' || mod.category === this.activeCategory;
            const matchesSearch = mod.title.toLowerCase().includes(this.searchQuery) || 
                                  mod.description.toLowerCase().includes(this.searchQuery) ||
                                  mod.categoryLabel.toLowerCase().includes(this.searchQuery);
            return matchesCategory && matchesSearch;
        });
    },

    renderModules() {
        const grid = document.getElementById('modulesGrid');
        if (!grid) return;

        const filtered = this.getFilteredModules();

        if (filtered.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
                    <h3 style="margin-bottom: 0.5rem;">No Modules Found</h3>
                    <p>Try adjusting your search criteria or category filter.</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = filtered.map(mod => `
            <div class="card project-card card-hover">
                <div>
                    <span class="card-tag">${mod.categoryLabel}</span>
                    <h3 class="card-title">${mod.title}</h3>
                    <p class="card-desc">${mod.description}</p>
                </div>
                <div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-muted); margin-top: 1rem;">
                        <span>Level: <strong style="color: var(--text-secondary);">${mod.level}</strong></span>
                        <span>Rating: <strong style="color: var(--warning-color);">${mod.rating}</strong></span>
                    </div>
                    <div class="card-footer">
                        <span style="font-size: 0.85rem; font-weight: 600;">👥 ${mod.students} Enrolled</span>
                        <button type="button" class="btn btn-primary" onclick="AppController.openModal(${mod.id})">View Module</button>
                    </div>
                </div>
            </div>
        `).join('');
    },

    renderActivityTable() {
        const tbody = document.getElementById('activityTableBody');
        if (!tbody) return;

        tbody.innerHTML = ACTIVITY_DATA.map(item => `
            <tr>
                <td><strong>${item.id}</strong></td>
                <td>${item.name}</td>
                <td><span style="color: var(--text-secondary); font-weight: 500;">${item.type}</span></td>
                <td>
                    <span class="status-badge status-${item.status}">
                        ● ${item.status.toUpperCase()}
                    </span>
                </td>
                <td><strong style="color: var(--primary-color);">${item.score}</strong></td>
                <td style="color: var(--text-muted); font-size: 0.85rem;">${item.updated}</td>
            </tr>
        `).join('');
    },

    animateStats() {
        const statElements = document.querySelectorAll('.stat-number');
        statElements.forEach(el => {
            const target = parseInt(el.getAttribute('data-target') || '0', 10);
            if (!target) return;
            
            let count = 0;
            const increment = Math.ceil(target / 40);
            const timer = setInterval(() => {
                count += increment;
                if (count >= target) {
                    count = target;
                    clearInterval(timer);
                }
                const suffix = el.getAttribute('data-suffix') || '';
                el.innerText = count.toLocaleString() + suffix;
            }, 30);
        });
    },

    openModal(id) {
        const mod = MODULES_DATA.find(m => m.id === id);
        if (!mod) return;

        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        const modalOverlay = document.getElementById('modalOverlay');

        if (modalTitle && modalBody && modalOverlay) {
            modalTitle.innerText = mod.title;
            modalBody.innerHTML = `
                <div style="margin-bottom: 1rem;">
                    <span class="card-tag">${mod.categoryLabel}</span>
                </div>
                <p style="margin-bottom: 1.5rem; line-height: 1.7;">${mod.description}</p>
                <div style="background: rgba(0, 0, 0, 0.04); padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1.5rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.9rem;">
                        <span>Target Skill Level:</span> <strong>${mod.level}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.9rem;">
                        <span>Active Learners:</span> <strong>${mod.students}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.9rem;">
                        <span>User Satisfaction:</span> <strong style="color: var(--warning-color);">${mod.rating}</strong>
                    </div>
                </div>
                <div style="display: flex; gap: 0.75rem; justify-content: flex-end;">
                    <button class="btn btn-secondary" onclick="AppController.closeModal()">Close</button>
                    <button class="btn btn-primary" onclick="alert('Successfully launched module environment!')">Launch Environment</button>
                </div>
            `;
            modalOverlay.classList.add('active');
        }
    },

    closeModal() {
        const modalOverlay = document.getElementById('modalOverlay');
        if (modalOverlay) {
            modalOverlay.classList.remove('active');
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    AppController.init();
});
