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
            if (!modal) return;

            if (!modal.classList.contains('is-visible')) {
                const topicName = listItem.id.replace('topic-', '');
                updateModalContent(topicName, latestTopicData);
            }

            modal.classList.toggle('is-visible');
        }

        // 閉じるボタンの処理
        if (event.target.classList.contains('close-btn')) {
            const modal = event.target.closest('.modal-box');
            if (modal) {
                modal.classList.remove('is-visible');
            }
        }

        // --- コピーボタンの処理
        if (event.target.classList.contains('copy-button')) {
            const button = event.target;
            const container = button.closest('.code-container');
            if (!container) {
                console.error('コードブロックコンテナがありません');
                return;
            }

            const codeElement = container.querySelector('code');
            if (!codeElement) {
                console.error('コードブロックがありません');
                return;
            }
            // クリップボードにコピーするテキストの取得
            const textToCopy = codeElement.textContent;

            // テキストをコピー
            navigator.clipboard.writeText(textToCopy).then(() => {
                button.classList.add('copied');

                // 2秒後にボタンの表示を元に戻す
                setTimeout(() => {
                    button.classList.remove('copied');
                }, 2000);

            }).catch(err => {
                console.error('クリップボードへのコピーに失敗しました', err);
            });
        }

    });
});