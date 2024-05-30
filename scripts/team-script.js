document.addEventListener('DOMContentLoaded', function() {
    const teamMembers = document.querySelectorAll('.team-member');
    const modal = document.getElementById('modal');
    const modalName = document.getElementById('modal-name');
    const modalRole = document.getElementById('modal-role');
    const modalDescription = document.getElementById('modal-description');
    const closeBtn = document.querySelector('.close');

    teamMembers.forEach(member => {
        member.addEventListener('click', function() {
            const name = this.dataset.name;
            const role = this.dataset.role;
            const description = this.dataset.description;

            modalName.textContent = name;
            modalRole.textContent = role;
            modalDescription.textContent = description;

            modal.style.display = 'block';
        });
    });

    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });

    // Animasi scroll
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = `fadeInUp 1s ease-out`;
                observer.unobserve(entry.target);
            }
        });
    });

    document.querySelectorAll('.team-member').forEach(member => {
        observer.observe(member);
    });
});
