const SOCKET_TAG_NAME = 'node-graph-socket';
export class MagnitNodeGraphSocket extends HTMLElement
{
    static get observedAttributes() { return ['label']; }
    static register() { if(!customElements.get(SOCKET_TAG_NAME)) { customElements.define(SOCKET_TAG_NAME, MagnitNodeGraphSocket); } }
    async connectedCallback() { this.dispatchComponentEvent(this, 'onconnect'); }
    attributeChangedCallback(name, oldValue, newValue) { this.dispatchComponentEvent(this, 'onattributechanged', { name: name, oldValue: oldValue, newValue: newValue }); }
    async disconnectedCallback() { this.dispatchComponentEvent(this, 'ondisconnect'); }
    adoptedCallback() { this.dispatchComponentEvent(this, 'onadopted'); }

    constructor()
    {
        super();
        this.addEventListener('onconnect', () =>
        {
            this.cursorPosition = { top: 0, left: 0, x: 0, y: 0 };
            this.boundHandlers =
            {
                documentConnectionOnMouseUp: this.document_connection_onMouseUp.bind(this)
            };

            this.attachDOM(SOCKET_CONTENT_TEMPLATE);
            this.registerStyle(STYLE_ID);

            this.$linkPreview = null;

            this.$label = this.querySelector('.label');            
            let $port = document.createElement('span');
            $port.classList.add('port');
            if(this.closest('.outputs') != null)
            {
                this.appendChild($port);
            }
            else
            {
                this.prepend($port);
            }
            this.$port = this.querySelector('.port');
            
            this.addEventListener('mousedown', (event) => { this.onMouseDown(event); });
            // this.addEventListener('contextmenu', (event) =>
            // {
            //     event.preventDefault();
            //     event.stopPropagation();
                
            //     let detail = this.getRelativePosition(event.clientX, event.clientY);
            //     detail.mouseEvent = event;
            //     this.dispatchComponentEvent(this, 'onnodemenu', detail);
            // });
        }, {once: true});
        this.addEventListener('onattributechanged', (update) =>
        {
            if(update.detail.name == 'label' && this.$label != null)
            {
                this.$label.textContent = update.detail.newValue;
            }
        });
    }

    onMouseDown(event)
    {
        if(event.button == 2)
        {
            return;
        }
        event.stopPropagation();
        if(this.getSocketType() == null)
        {
            return;
        }


        this.dispatchComponentEvent(this, 'onstartlinkconnection', { mouseEvent: event });
        document.addEventListener('mouseup', this.boundHandlers.documentConnectionOnMouseUp);
    }
    document_connection_onMouseUp(event)
    {
        this.dispatchComponentEvent(this, 'onendlinkconnection', {mouseEvent: event}); 
        document.removeEventListener('mouseup', this.boundHandlers.documentConnectionOnMouseUp);
    }

    getSocketType()
    {
        let socketType = null;
        if(this.closest('.inputs') != null)
        {
            socketType = 'input';
        }
        if(this.closest('.outputs') != null)
        {
            socketType = 'output';
        }
        return socketType;
    }

    dispatchComponentEvent($target, eventName, data)
    {
        if($target == this)
        {
            let customEvent = (data) ? new CustomEvent(eventName, { detail: data }) : new CustomEvent(eventName);
            this.dispatchEvent(customEvent);
        }
        this.dispatchAttributeEvents($target, eventName, data);
    }
    dispatchAttributeEvents($target, eventName, data)
    {
        let handlerAttributeName = 'on' + eventName;
        let onEvent = $target.getAttribute(handlerAttributeName);
        if(onEvent && onEvent != 'null')
        {
            try
            {
                onEvent = onEvent.split('.').reduce((o,i)=> { return o[i]; }, window);
                
                let context = this;
                let eventContext = $target.getAttribute('event-context');
                if(eventContext != null)
                {
                    context = eventContext.split('.').reduce((o,i)=> { return o[i]; }, window);
                }
                onEvent.apply(context, {target: $target, detail: data });
            }
            catch(exception)
            {
                console.error("Unable to execute callback: ");
                console.error(exception);
            }
        }
    }

    attachDOM(template)
    {
        let fragment;
        if(!(template instanceof HTMLTemplateElement))
        {
            let content = template;
            template = document.createElement('template');
            template.innerHTML = content;
        }
        fragment = template.content.cloneNode(true);

        const slots = fragment.querySelectorAll('slot');
        for(const $slot of slots)
        {
            let $replacement = this.querySelector(`[slot="${$slot.name}"]`);
            if($replacement != null)
            {
                $replacement.classList.add($slot.name);
                $slot.parentNode.replaceChild($replacement, $slot);
            }
            else if($slot.firstElementChild != null)
            {
                $slot.parentNode.replaceChild($slot.firstElementChild, $slot);
            }
            else
            {
                let tagName = 'span';
                if($slot.dataset.slotTag != null && $slot.dataset.slotTag.trim() != "")
                {
                    tagName = $slot.dataset.slotTag;
                }
                $replacement = document.createElement(tagName);
                $replacement.classList.add($slot.name);
                $replacement.innerHTML = $slot.innerHTML;
                $slot.parentNode.replaceChild($replacement, $slot);
            }
        }

        this.innerHTML = "";
        this.appendChild(fragment);
    }

    registerStyle(styleId)
    {
        let target = (this.shadowRoot == null) ? this : this.shadowRoot;
        let style = target.querySelector('style');
        if(style == null)
        {
            return;
        }

        style.remove();

        let existingStyle = document.querySelector(`style[data-id="${styleId}"]`);
        if(existingStyle == null)
        {
            style.dataset.id = styleId;
            document.head.appendChild(style);
        }        
    }
    
    getDescendants($node, recurse)
    {
        $node = $node || this;
        recurse = (recurse == false) ? false : true;
        let descendants = [];
        for(let i = 0; i < $node.childNodes.length; i++)
        {
            let node = $node.childNodes[i];
            descendants.push(node)
            if(node.childNodes && recurse == true)
            {
                descendants.push(...this.getDescendants(node))
            }
        }

        return descendants;
    }
}



const SOCKET_CONTENT_TEMPLATE = `<style>
${SOCKET_TAG_NAME}
{ 
    display: flex;
    align-items: center;
    --background-color: #f2f2f2;
    --line-color: rgba(0,0,0,.05);
    --cross-color: #aaaaaa;
    cursor: grab;
}
@media (prefers-color-scheme: dark)
{
    ${SOCKET_TAG_NAME}
    {
        --background-color: #444;
        --line-color: rgba(0,0,0,.1);
        --cross-color: #282828;
    }
}
</style>
<slot name="label">Socket</slot>`;

MagnitNodeGraphSocket.register();