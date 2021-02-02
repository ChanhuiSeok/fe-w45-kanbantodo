import * as _dom from '../src/util';

/*
    ModalView.js
    모달이 표시되어야 하는 뷰와 관련된 이벤트, 핸들러 등록
*/

class ModalView {
    constructor(model) {
        this.modalView = _dom.query('.modal');
        this.removeModal = _dom.query('.modal-remove'); // 삭제 모달
        this.editModal = _dom.query('.modal-edit'); // 수정 모달

        this.modalSaveBtn = _dom.query('.btn-save-modal'); // 노트 제목 수정
        this.modalWriteBtn = _dom.query('.btn-write-modal'); // 새로운 카드 생성
        this.modalAcceptBtn = _dom.query('.btn-accept-modal'); // 노트 수정 예 버튼
        this.modalCloseBtn = _dom.query('.btn-close-modal'); // 노트 수정 아니오 버튼

        this.removeCardModal = _dom.query('.modal-card-remove'); // 삭제 모달
        this.cardRemoveBtn = _dom.query('.btn-card-accept'); // 삭제 예 버튼
        this.cardCancelBtn = _dom.query('.btn-card-close'); // 삭제 아니오 버튼

        this.model = model;
        this.model.subscribe(this.update.bind(this));
    }

    onEvents() { // 이벤트 관련 함수 등록
        this.removeNote();
        this.editTitle();
        this.addNewCard();
        this.removeCard();
    }

    update() {
        this.onEvents();
    }
    init() {
        this.onEvents();
    }

    // remove note item
    async removeNoteHandler(e) {
        const cardId = _dom.getAttr({ nodeList: e.target, attr: 'data' });
        const id = _dom.getAttr({ nodeList: e.target, attr: 'data-idx' });
        const cardName = _dom.getCardName({ cardId });
        const noteTitle = _dom.getNoteTitle({ cardId, id });
        await this.model.setModalState({ cardId, id });

        _dom.removeClass({
            nodeList: [this.modalView, this.removeModal],
            className: 'none'
        })
        this.modalAcceptBtn.addEventListener('click', function () {
            this.model.removeTodo(this.model.state);
            _dom.addClass({
                nodeList: [this.modalView, this.removeModal],
                className: 'none'
            })
            // add history (action : remove)
            this.model.setHistoryState({
                cardName: cardName,
                beforeTitle: '',
                afterTitle: noteTitle,
                action: 'REMOVE_NOTE'
            });
        }.bind(this))
        this.modalCloseBtn.addEventListener('click', () => {
            _dom.addClass({
                nodeList: [this.modalView, this.removeModal],
                className: 'none'
            })
        })
    }
    async removeNote() {
        const { } = await this.model.getInitialData();
        const removeListBtn = _dom.queryAll('.list-remove');
        removeListBtn.forEach(element => {
            element.addEventListener('click', this.removeNoteHandler.bind(this));
        })
    }

    // edit note/card item
    async editHandler(e) {
        const cardId = e.currentTarget.getAttribute('data');
        const id = e.currentTarget.getAttribute('data-idx');
        const modalHeader = _dom.query('.modal-header-title');
        const modalInput = _dom.query('.modal-input');
        const cardName = _dom.getCardName({ cardId });
        const noteTitle = _dom.getNoteTitle({ cardId, id});

        let mode = '';
        modalInput.value = '';

        _dom.addClass({
            nodeList: [this.modalWriteBtn],
            className: "none"
        });
        _dom.removeClass({
            nodeList: [this.modalView, this.editModal, this.modalSaveBtn],
            className: "none"
        });
        if (id == -1) {
            mode = 'card';
            _dom.html(modalHeader, '카드 제목 수정하기');
        }
        else {
            mode = 'list';
            _dom.html(modalHeader, '노트 제목 수정하기');
        }
        await this.model.setModalState({ cardId, id, mode });

        this.modalSaveBtn.addEventListener('click', function () {
            const newTitle = modalInput.value;
            const input = { input: { title: newTitle } };
            this.model.editTodo({ ...this.model.state, input }, this.model.state.mode);
            _dom.addClass({
                nodeList: [this.modalView, this.editModal],
                className: "none"
            });
            if (mode === 'card') {
                // add history (action : EDIT_CARD, change [cardName] to [title])
                this.model.setHistoryState({
                    cardName: cardName,
                    beforeTitle: '',
                    afterTitle: newTitle,
                    action: 'EDIT_CARD'
                }); // history 상태 변경
            }
            else if (mode === 'list') {
                // add history (action: EDIT_NOTE)
                this.model.setHistoryState({
                    cardName: cardName,
                    beforeTitle: noteTitle,
                    afterTitle: newTitle,
                    action: 'EDIT_NOTE'
                }); // history 상태 변경
            }
        }.bind(this))
    }
    async editTitle() {
        const { } = await this.model.getInitialData();
        const card = _dom.queryAll('.card-header');
        const note = _dom.queryAll('.list-view');
        const closeBtn = _dom.query('.btn-edit-close-modal');
        note.forEach(element => {
            element.addEventListener('dblclick', this.editHandler.bind(this));
        })
        card.forEach(element => {
            element.addEventListener('dblclick', this.editHandler.bind(this));
        })
        closeBtn.addEventListener('click', () => {
            _dom.addClass({
                nodeList: [this.modalView, this.editModal],
                className: "none"
            });
        })
    }

    // add card 
    addNewCardHandler() {
        const modalHeader = _dom.query('.modal-header-title');
        const modalInput = _dom.query('.modal-input');
        modalInput.value = '';
        _dom.addClass({
            nodeList: [this.modalSaveBtn],
            className: 'none'
        })
        _dom.removeClass({
            nodeList: [this.modalView, this.editModal, this.modalWriteBtn],
            className: 'none'
        })
        _dom.html(modalHeader, '새로운 카드 추가하기');
        this.modalWriteBtn.addEventListener('click', function () {
            const newTitle = modalInput.value;
            this.model.addCard({ name: newTitle, author: "roddy.chan" });
            _dom.addClass({
                nodeList: [this.modalView, this.editModal],
                className: 'none'
            })
            // add history (action : ADD_CARD, cardName : newTitle)
            this.model.setHistoryState({
                cardName: newTitle,
                beforeTitle: '',
                afterTitle: '',
                action: 'ADD_CARD'
            }); 
        }.bind(this))
    }
    async addNewCard() {
        const { } = await this.model.getInitialData();
        const addBtn = _dom.query('.card-new');
        addBtn.addEventListener('click', this.addNewCardHandler.bind(this));
    }

    // remove card
    removeCardHandler(e) {
        const cardId = _dom.getAttr({ nodeList: e.target, attr: 'data' });
        const cardName = _dom.getCardName({cardId});
        _dom.removeClass({
            nodeList: [this.modalView, this.removeCardModal],
            className: 'none'
        })
        this.cardRemoveBtn.addEventListener('click', function () {
            this.model.removeCard({ cardId });
            _dom.addClass({
                nodeList: [this.modalView, this.removeCardModal],
                className: 'none'
            })
            // add history (action : REMOVE_CARD, cardName : newTitle)
            this.model.setHistoryState({
                cardName: cardName,
                beforeTitle: '',
                afterTitle: '',
                action: 'REMOVE_CARD'
            }); 
        }.bind(this))
        this.cardCancelBtn.addEventListener('click', () => {
            _dom.addClass({
                nodeList: [this.modalView, this.removeCardModal],
                className: 'none'
            })
        })
    }
    async removeCard() {
        const { } = await this.model.getInitialData();
        const removeBtn = _dom.queryAll('.htop-remove');
        removeBtn.forEach(element => {
            element.addEventListener('click', this.removeCardHandler.bind(this));
        });
    }

}
export default ModalView;