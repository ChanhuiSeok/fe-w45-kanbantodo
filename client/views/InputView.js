/*
    InputView.js : [+]를 누를 때 나오는 input-view
    - 모델 객체를 주입받고 구독하는 [Observer] 이다.
*/
import * as _dom from '../src/util';

/* TodoModel을 구독하는 Observer */
class InputView {
    constructor(model) {
        this.model = model; // 생성 시 구독할 model(여기서는 TodoModel)을 주입받고 구독한다.
        this.model.subscribe(this.update.bind(this))
    }

    onEvents() {
        this.setClickBtn();
        this.inputNoteData();
    }
    
    update(){
        this.onEvents();
    }

    init() {
        this.onEvents();
    }

    // Event handler
    addInputHandler(e){
        const inputArea = _dom.queryAll('.list-input');
        const cardId = e.target.getAttribute('data');
        const cardName = _dom.getCardName({cardId});
        let inputData = '';

        inputArea.forEach(element => {
            if (element.getAttribute('data') === cardId) {
                inputData = element.value;
                this.model.addTodo({cardId, inputData});
                // add history
                this.model.setHistoryState({
                    cardName: cardName,
                    beforeTitle: '',
                    afterTitle: inputData,
                    action: 'ADD_NOTE'
                });
            }
        })
    }

    removeInputHandler(e){
        const inputArea = _dom.queryAll('.list-input');
        const idx = e.target.getAttribute('data');
        inputArea.forEach(element => {
            if (element.getAttribute('data') === idx) {
                element.value = "";
            }
        })
    }

    toggleEvtHandler(e){
        const inputDiv = _dom.queryAll('.input-list-view');
        const idx = e.target.getAttribute('data');
        inputDiv.forEach(element => {
            if (element.getAttribute('data') === idx) {
                element.classList.toggle("none");
            }
        })
    }

    async inputNoteData() {
        const { } = await this.model.getInitialData();
        const inputBtn = _dom.queryAll('.btn-add-list');
        const cancelBtn = _dom.queryAll('.btn-cancel-list');
        inputBtn.forEach(element => {
            element.addEventListener('click', this.addInputHandler.bind(this));
        })
        cancelBtn.forEach(element => {
            element.addEventListener('click', this.removeInputHandler.bind(this));
        })
    }

    async setClickBtn() {
        const { } = await this.model.getInitialData();
        const cardBtn = _dom.queryAll('.card-btn.htop-add');
        cardBtn.forEach(element => {
            element.addEventListener('click', this.toggleEvtHandler.bind(this))
        });
    }

}

export default InputView;