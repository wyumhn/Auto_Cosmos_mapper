document.addEventListener('DOMContentLoaded', () => {

    /*
    *
    * モーダルボックスの作成
    *
    */

    const topicList = document.getElementById('topic-list');

    topicList.addEventListener('click', function(event) {

        if (event.target.tagName === 'A') {
            event.preventDefault();

            const listItem = event.target.closest('li');
            if (!listItem) return;

            const modalId = `${listItem.id}-info`;

            // すでに表示されているモーダルがあれば非表示に
            const existingModal = document.querySelector('.modal-box.is-visible');
            if (existingModal && existingModal.id !== modalId) {
                existingModal.classList.remove('is-visible');
            }

            // 対応するモーダルを探して、まだ存在しない場合は新規作成
            let modal = document.getElementById(modalId);
            if (!modal) {
                console.warn('対応するモーダルボックスがありませんでした:');
                return;
            } else {
            modal.classList.toggle('is-visible');
            }

        }

        // 閉じるボタンの処理
        if (event.target.classList.contains('close-btn')) {
            const modal = event.target.closest('.modal-box');
            if (modal) {
                modal.classList.remove('is-visible');
            }
        }

    });
});