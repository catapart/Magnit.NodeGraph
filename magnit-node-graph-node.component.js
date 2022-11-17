const NODE_TAG_NAME = 'node-graph-node';
export class MagnitNodeGraphNode extends HTMLElement
{
    static get observedAttributes() { return ['template']; }
    static register() { if(!customElements.get(NODE_TAG_NAME)) { customElements.define(NODE_TAG_NAME, MagnitNodeGraphNode); } }
    async connectedCallback() { this.dispatchComponentEvent(this, 'onconnect'); }
    attributeChangedCallback(name, oldValue, newValue) { this.dispatchComponentEvent(this, 'onattributechanged', { name: name, oldValue: oldValue, newValue: newValue }); }
    async disconnectedCallback() { this.dispatchComponentEvent(this, 'ondisconnect'); }
    adoptedCallback() { this.dispatchComponentEvent(this, 'onadopted'); }

    constructor()
    {
        super();
        this.nodeId = crypto.randomUUID();
        this.addEventListener('onconnect', () =>
        {
            this.contentTemplate = this.getTemplate();
            this.sockets = [];
            this.cancelSelection = false;

            this.boundHandlers =
            {
                documentOnMouseMove: this.document_onMouseMove.bind(this),
                documentOnMouseUp: this.document_onMouseUp.bind(this),
            };

            this.style.cursor = 'grab';
            this.attachDOM(this.contentTemplate);
            this.registerStyle(STYLE_ID);

            this.$header = this.querySelector('header');
            this.$label = this.querySelector('.label');
            this.$icon = this.querySelector('.icon');
            this.$inputs = this.querySelector('.inputs');
            this.$outputs = this.querySelector('.outputs');

            
            this.addEventListener('mousedown', this.onMouseDown);
            this.addEventListener('click', (event) =>
            {
                if(!this.cancelSelection && (event.target == this || event.target.parentNode == this || event.target == this.$header || event.target.parentNode == this.$header))
                {
                    this.dispatchComponentEvent(this, 'onuserselected', {mouseEvent: event});
                }

                // restore gate
                this.cancelSelection = false;
            });

        }, {once: true});
        this.addEventListener('onattributechanged', (update) =>
        {
            if(update.detail.name == 'template')
            {
                this.contentTemplate = this.getTemplate(update.detail.newValue);
                if(this.contentTemplate != NODE_DEFAULT_CONTENT_TEMPLATE && this.contentTemplate != null && this.contentTemplate instanceof HTMLTemplateElement)
                {
                    this.dataset.nodeKey = this.contentTemplate.dataset.nodeKey;
                }
                this.attachDOM(this.contentTemplate);
            }
        });
    }


    getTemplate(templateKey)
    {
        if(templateKey == null || templateKey.trim() == "")
        {
            return NODE_DEFAULT_CONTENT_TEMPLATE;
        }

        let $template;
        if(templateKey.startsWith('./'))
        {
            //todo: fetch from url
        }
        else
        {
            $template = document.querySelector(`template${templateKey}`);
        }

        return $template || NODE_DEFAULT_CONTENT_TEMPLATE;
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

    addInputSocket(label = null)
    {
        return this.addSocket('input', label);
    }
    addOutputSocket(label = null)
    {
        return this.addSocket('output', label);
    }
    addSocket(type, label = null)
    {
        let $container = document.createElement('li');
        $container.classList.add('socket');

        let $newSocket = document.createElement('node-graph-socket');
        $container.appendChild($newSocket);

        const $socketList = (type == "input") ? this.$inputs : this.$outputs;

        const $firstAction = this.querySelector('.action');
        if($firstAction == null)
        {
            $socketList .appendChild($container);
        }
        else
        {
            $socketList .insertBefore($container, $firstAction);
        }

        if(label != null)
        {
            $newSocket.setAttribute("label", label);
        }

        this.closest('node-graph')?.registerNodeSocket($newSocket);

        return $newSocket;
    }

    onMouseDown(event)
    {
        if(event.button == 2 || (event.target != this && event.target.parentNode != this && event.target != this.$header && event.target.closest('header') != this.$header))
        {
            return;
        }
        event.stopPropagation();

        this.style.cursor = 'grabbing';
        this.style.userSelect = 'none';

        this.cursorPosition = 
        {
            x: event.clientX,
            y: event.clientY,
        };

        document.addEventListener('mousemove', this.boundHandlers.documentOnMouseMove);
        document.addEventListener('mouseup', this.boundHandlers.documentOnMouseUp);
    }
    document_onMouseMove(event)
    {
        // How far the mouse has been moved
        const deltaX = event.clientX - this.cursorPosition.x;
        const deltaY = event.clientY - this.cursorPosition.y;

        // move the element
        this.style.setProperty('--top', `${this.offsetTop + deltaY}px`);
        this.style.setProperty('--left', `${this.offsetLeft + deltaX}px`);

        this.dispatchComponentEvent(this, 'onnodemove', {deltaX, deltaY});

        // set the new cursor position
        this.cursorPosition = 
        {
            x: event.clientX,
            y: event.clientY,
        };

        // prevent dragging from deselecting or selecting the node
        this.cancelSelection = true;
    }
    document_onMouseUp(event)
    {
        this.style.cursor = 'grab';
        this.style.removeProperty('user-select');

        document.removeEventListener('mousemove', this.boundHandlers.documentOnMouseMove);
        document.removeEventListener('mouseup', this.boundHandlers.documentOnMouseUp);

    }
}



const NODE_DEFAULT_CONTENT_TEMPLATE = `<style>
${NODE_TAG_NAME}
{
    position: absolute;
    top: var(--top);
    left: var(--left);
    background-color: var(--background-color);
    display: grid;
    grid-template-areas: "header header header"
                         "inputs content outputs";
    overflow: hidden;
}
${NODE_TAG_NAME}.selected
{
    background-color: red;
}
@media (prefers-color-scheme: dark)
{
    ${NODE_TAG_NAME}
    {
        --background-color: #444;
        --line-color: rgba(0,0,0,.1);
        --cross-color: #282828;
    }
}

${NODE_TAG_NAME} > header
{
    grid-area: header;
}
${NODE_TAG_NAME} > .inputs
{
    grid-area: inputs;
}
${NODE_TAG_NAME} > .content
{
    grid-area: content;
}
${NODE_TAG_NAME} > .outputs
{
    grid-area: outputs;
}
</style>
<header>
    <span class="title">
    <slot name="icon"></slot>
    <slot name="label">Node</slot>
    </span>
</header>
<slot name="inputs" data-slot-tag="ul"></slot>
<div class="content"><slot name="content"></slot></div>
<slot name="outputs" data-slot-tag="ul"></slot>`;

MagnitNodeGraphNode.register();