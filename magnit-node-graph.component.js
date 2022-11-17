const SVG_OFFSET = 5000;

const ZOOM_STEP = .05;
const ZOOM_POSITIONOFFSET_STEP = 20;

const GRAPH_TAG_NAME = 'node-graph';
const NODE_TAG_NAME = 'node-graph-node';
const SOCKET_TAG_NAME = 'node-graph-socket';

const DEFAULT_STYLE = `<style>
${GRAPH_TAG_NAME}
{ 
    display: block;
    position: relative;
    width: var(--width, 100%);
    height: var(--height, 100%);
    scrollbar-color: rgba(90, 90, 90, 1) var(--background-color);
    scrollbar-width: thin;
    font-family: sans-serif;
    box-shadow: var(--graph-shadow);
    border-radius: 5px;
    overflow: auto;
    overflow: overlay;

    --background-color: #f2f2f2;
    --line-color: rgba(0,0,0,.05);
    --cross-color: #aaaaaa;
    --graph-shadow: 0 0 6px rgba(0,0,0,.3);
}
@media (prefers-color-scheme: dark)
{
    ${GRAPH_TAG_NAME}
    {
        --background-color: #444;
        --line-color: rgba(0,0,0,.1);
        --cross-color: #282828;
        --graph-shadow: 0 0 6px rgba(0,0,0,.3);
        --node-shadow: 0 2px 3px 2px rgba(0,0,0,.4);

        --dark-mode-blue: #4393cb;
        --light-yellow: rgb(248,164,33);
        --light-yellow-30: rgba(248,164,33,.3);
        --dark-yellow: rgb(147,102,32);
    }
}

${GRAPH_TAG_NAME} .background
{
    width: 50000px;
    height: 50000px;
    position: absolute;
    top: 0;
    left: 0;

    z-index: 0;

    background:
        linear-gradient(-90deg, var(--line-color) 1px, transparent 1px),
        linear-gradient(var(--line-color) 1px, transparent 1px), 
        linear-gradient(-90deg, rgba(0, 0, 0, .04) 1px, transparent 1px),
        linear-gradient(var(--line-color) 1px, transparent 1px),
        linear-gradient(transparent 3px, var(--background-color) 3px, var(--background-color) 78px, transparent 78px),
        linear-gradient(-90deg, var(--cross-color) 1px, transparent 1px),
        linear-gradient(-90deg, transparent 3px, var(--background-color) 3px, var(--background-color) 78px, transparent 78px),
        linear-gradient(var(--cross-color) 1px, transparent 1px),
        var(--background-color);
    background-size:
        4px 4px,
        4px 4px,
        80px 80px,
        80px 80px,
        80px 80px,
        80px 80px,
        80px 80px,
        80px 80px;
}
${GRAPH_TAG_NAME} .canvas
{
    width: 50000px;
    height: 50000px;
    position: absolute;
    top: var(--canvasTop, 0);
    left: var(--canvasLeft, 0);

    transform: scale(var(--zoomScale));
    transition: transform 100ms linear;
}

${GRAPH_TAG_NAME} .canvas .link
{
    top:var(--top);
    left:var(--left);
    position: absolute;
    width: ${SVG_OFFSET}px;
    height: ${SVG_OFFSET}px;
    pointer-events: none;
}

${GRAPH_TAG_NAME}::-webkit-scrollbar {
    width: 10px;
    height: 10px;
    background: transparent;
}
${GRAPH_TAG_NAME}::-webkit-scrollbar-corner
{
    background: transparent;
}
${GRAPH_TAG_NAME} ::-moz-scrollbar-corner
{
    background: transparent;
}
  
${GRAPH_TAG_NAME}::-webkit-scrollbar-thumb {
    background: rgba(90, 90, 90, .5);
    border-radius: 30px;
}



${NODE_TAG_NAME}
{
    position: absolute;
    top: var(--top);
    left: var(--left);
    margin: 0;
    padding: 0;
    background-color: var(--background-color);
    border: solid 1px transparent;
    box-shadow: var(--node-shadow);
    display: grid;
    grid-template-areas: "header header header"
                         "inputs content outputs";
    overflow: hidden;
    color: var(--text-color);
    border-radius: 3px;
    --header-background-color: #ffffff;
}
${NODE_TAG_NAME}.selected
{
    box-shadow: var(--node-selected-shadow);
    border-color: var(--dark-yellow);
    --node-selected-shadow: 0 0 6px var(--light-yellow-30);
}
@media (prefers-color-scheme: dark)
{
    ${NODE_TAG_NAME}
    {
        --header-background-color: #202020;
        --background-color: #2b2b2b;
        --text-color: #a6a6a6;
        --button-background-color: #202020;
        --button-text-color: #a6a6a6;
        --button-hover-background-color: #141414;
        --button-hover-text-color: #FFFFFF;
        --input-background-color: #1a1a1a;
        --input-text-color: #aaa;
        --input-border-color: #101010;
        --input-focus-border-color: var(--dark-yellow);
    }
}

${NODE_TAG_NAME} > header
{
    grid-area: header;
    background-color: var(--header-background-color);
    border-top-radius: 3px;
    border-bottom: solid 1px rgba(0,0,0,.4);
}
${NODE_TAG_NAME} > header .title
{
    display: block;
    padding: .3rem .5rem;
}
${NODE_TAG_NAME} > .inputs
{
    grid-area: inputs;
}
${NODE_TAG_NAME} > .content
{
    grid-area: content;
    display: flex;
}
${NODE_TAG_NAME} > .outputs
{
    grid-area: outputs;
}
${NODE_TAG_NAME} > .inputs
,${NODE_TAG_NAME} > .outputs
{
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    margin-top: .5rem;
}

${NODE_TAG_NAME} > .inputs
{
}
${NODE_TAG_NAME} > .outputs ${SOCKET_TAG_NAME}
{
    justify-content: flex-end;
}

${NODE_TAG_NAME} > .inputs .action
,${NODE_TAG_NAME} > .outputs .action
{
    display: flex;
    margin-top: auto;
}

${NODE_TAG_NAME} > .inputs .action button
,${NODE_TAG_NAME} > .outputs .action button
{
    flex: 1;
    font-size: .7rem;
    background-color: var(--button-background-color);
    color: var(--button-text-color);
    border: solid 1px rgba(0,0,0,.3);
    margin: .3rem .3rem .5rem;
    cursor: pointer;
}
${NODE_TAG_NAME} > .inputs .action button:hover
,${NODE_TAG_NAME} > .outputs .action button:hover
{
    background-color: var(--button-hover-background-color);
    color: var(--button-hover-text-color);
}

${NODE_TAG_NAME} input
,${NODE_TAG_NAME} select
,${NODE_TAG_NAME} textarea
{
    flex: 1;
    font-family: courier;
    padding: .3em .5em;
    margin: .5rem .5rem .3rem .5rem;
    border: solid 1px;
    border-radius: 3px;
    background-color: var(--input-background-color);
    color: var(--input-text-color);
    border-color: var(--input-border-color);
}
${NODE_TAG_NAME} input:focus
,${NODE_TAG_NAME} select:focus
,${NODE_TAG_NAME} textarea:focus
{
    border-color: var(--input-focus-border-color);
}

${NODE_TAG_NAME} textarea
{
    min-height: 120px;
}


${SOCKET_TAG_NAME}
{ 
    display: flex;
    align-items: center;
    --background-color: #f2f2f2;
    --line-color: rgba(0,0,0,.05);
    --cross-color: #aaaaaa;
    cursor: grab;
    padding: .2em .5em;
    font-size: .7rem;
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
${SOCKET_TAG_NAME} .label
{
    white-space: nowrap;
}
${SOCKET_TAG_NAME}.target .label
{
    color: white;
}
${SOCKET_TAG_NAME} .port
{
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: solid 1px white;
}
${GRAPH_TAG_NAME}:not(.linking) ${SOCKET_TAG_NAME}:hover .port
{
    border-color: #f8a421;
}
${GRAPH_TAG_NAME}:not(.linking) ${SOCKET_TAG_NAME}:hover .label
{
    color: #fff;
}
${SOCKET_TAG_NAME}.target .port
{
    border-color: var(--dark-mode-blue);
}
${SOCKET_TAG_NAME} .label + .port
,${SOCKET_TAG_NAME} .port + .label
{
    margin-left: .7em;
}
</style>`;

const GRAPH_DEFAULT_CONTENT_TEMPLATE = `${DEFAULT_STYLE}
<div class="background"></div>
<div class="canvas"></div>
<ul class="panels"></ul>`;

const NODE_DEFAULT_CONTENT_TEMPLATE = `<header>
    <span class="title">
    <slot name="icon"></slot>
    <slot name="label">Node</slot>
    </span>
</header>
<slot name="inputs" data-slot-tag="ul"></slot>
<div class="content"><slot name="content"></slot></div>
<slot name="outputs" data-slot-tag="ul"></slot>`;

const SOCKET_DEFAULT_CONTENT_TEMPLATE = `<slot name="label">Socket</slot>`;

const STYLE_ID = crypto.randomUUID(); // only import style once per library import
const BaseComponent = (htmlElementClass = HTMLElement) => class extends htmlElementClass
{
    
    static get observedAttributes() { return []; }
    async connectedCallback() { this.dispatchComponentEvent(this, 'onconnect'); }
    attributeChangedCallback(name, oldValue, newValue) { this.dispatchComponentEvent(this, 'onattributechanged', { name: name, oldValue: oldValue, newValue: newValue }); }
    async disconnectedCallback() { this.dispatchComponentEvent(this, 'ondisconnect'); }
    adoptedCallback() { this.dispatchComponentEvent(this, 'onadopted'); }

    constructor()
    {
        super();
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

    registerStyle()
    {
        let target = (this.shadowRoot == null) ? this : this.shadowRoot;
        let style = target.querySelector('style');
        if(style == null)
        {
            return;
        }

        style.remove();

        let existingStyle = document.querySelector(`style[data-id="${STYLE_ID}"]`);
        if(existingStyle == null)
        {
            style.dataset.id = STYLE_ID;
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


export class MagnitNodeGraph extends BaseComponent()
{
    // Component
    static get observedAttributes() { return ['width', 'height']; }
    static register() { if(!customElements.get(GRAPH_TAG_NAME)) { customElements.define(GRAPH_TAG_NAME, MagnitNodeGraph); } }

    constructor()
    {
        super();
        this.recordId = crypto.randomUUID();
        this.addEventListener('onconnect', () =>
        {
            this.isZoomingOut;
            this.zoomScale = 1;

            this.cursorPosition = { top: 0, left: 0, x: 0, y: 0 };
            this.socketLinks = [];
            this.activeSocketLinks = [];

            this.$connectionTargetSocket = null;

            this.boundHandlers =
            {
                graph_documentOnMouseMove: this.graph_document_onMouseMove.bind(this),
                graph_documentOnMouseUp: this.graph_document_onMouseUp.bind(this),
                socket_documentOnMouseMove: this.socket_document_onMouseMove.bind(this),
                socket_onMouseEnter: this.socket_onMouseEnter.bind(this),
                socket_onMouseOut: this.socket_onMouseOut.bind(this),
            };

            this.attachDOM(GRAPH_DEFAULT_CONTENT_TEMPLATE);
            this.registerStyle();

            this.style.cursor = 'grab';

            this.$canvas = this.querySelector('.canvas');
            this.$panels = this.querySelector('.panels');
            this.scroll(this.$canvas.offsetWidth / 2, this.$canvas.offsetHeight / 2);

            this.addEventListener('mousedown', this.graph_onMouseDown);
            this.addEventListener('contextmenu', (event) =>
            {
                event.preventDefault();
                event.stopPropagation();
                
                let detail = this.getRelativePosition(event.clientX, event.clientY);
                detail.mouseEvent = event;
                this.dispatchComponentEvent(this, 'onnodemenu', detail);
            });


            document.addEventListener('keydown', (event) =>
            {
                if(event.key == "Alt")
                {
                    this.isZoomingOut = true;
                    this.zoomHandler();
                    event.preventDefault();
                    event.stopPropagation();
                }
                let selected = this.querySelectorAll('node-graph-node.selected');
                if(selected.length == 0)
                {
                    return;
                }
                switch(event.key)
                {
                    case "Backspace":
                    case "Delete":
                        for(let $node of selected)
                        {
                            this.removeNode($node);
                        }
                        break;
                    case "Escape":
                        for(let $node of selected)
                        {
                            $node.classList.remove('selected');
                        }
                        break;
                }
            });
            document.addEventListener('keyup', (event) =>
            {
                if(event.key == "Alt")
                {
                    this.isZoomingOut = false;
                    this.zoomHandler();
                    event.preventDefault();
                    event.stopPropagation();
                }
            });
        }, {once: true});
        this.addEventListener('onattributechanged', (update) =>
        {
            if(update.detail.name == 'width')
            {
                this.style.setProperty('--width', update.detail.newValue);
            }
            else if(update.detail.name == 'height')
            {
                this.style.setProperty('--height', update.detail.newValue);
            }
        });

        this.zoomHandler = () => 
        {
            this.zoomScale = (this.isZoomingOut) ? .3 : 1;            
            this.style.setProperty('--zoomScale', this.zoomScale);
        }
    }
    // End Component

    // Graph
    graph_onMouseDown(event)
    {
        if(event.button == 2)
        {
            return;
        }

        if(event.target.closest(NODE_TAG_NAME) != null)
        {
            return;
        }

        this.style.cursor = 'grabbing';
        this.style.userSelect = 'none';

        this.cursorPosition = 
        {
            left: this.scrollLeft,
            top: this.scrollTop,
            // Get the current mouse position
            x: event.clientX,
            y: event.clientY,
        };        

        document.addEventListener('mousemove', this.boundHandlers.graph_documentOnMouseMove);
        document.addEventListener('mouseup', this.boundHandlers.graph_documentOnMouseUp);
    }
    graph_document_onMouseMove(event)
    {
        // How far the mouse has been moved
        let deltaX = event.clientX - this.cursorPosition.x;
        let deltaY = event.clientY - this.cursorPosition.y;

        if(this.isZoomingOut)
        {
            deltaX *= 1.5;
            deltaY *= 1.5;
        }

        // Scroll the element
        this.scrollTop = this.cursorPosition.top - deltaY;
        this.scrollLeft = this.cursorPosition.left - deltaX;
    }
    graph_document_onMouseUp(event)
    {
        this.style.cursor = 'grab';
        this.style.removeProperty('user-select');

        document.removeEventListener('mousemove', this.boundHandlers.graph_documentOnMouseMove);
        document.removeEventListener('mouseup', this.boundHandlers.graph_documentOnMouseUp);

        let totalDistanceX = Math.abs(event.clientX - this.cursorPosition.x);
        let totalDistanceY = Math.abs(event.clientY - this.cursorPosition.y);

        if(totalDistanceX + totalDistanceY < 3)
        {
            let previouslySelected = this.$canvas.querySelectorAll('node-graph-node.selected');
            for(let $node of previouslySelected)
            {
                $node.classList.remove('selected');
            }
        }
    }
    // End Graph

    // Sockets
    socket_onStartSocketConnection(event)
    {
        let mouseEvent = event.detail.mouseEvent;
        if(mouseEvent.button == 2)
        {
            return;
        }

        this.activeSocketLinks = [];
        this.activeSocketLinks.push(mouseEvent.currentTarget);
        let eventTarget_socketType = this.activeSocketLinks[0].getSocketType();
        if(eventTarget_socketType == null)
        {
            return;
        }

        this.classList.add('linking');

        this.$connectionTargetSocket = null;

        this.style.cursor = 'grabbing';
        this.style.userSelect = 'none';

        if(mouseEvent.ctrlKey)
        {
            let $connectedSockets = [];
            let linksToRemove = [];
            for(let $link of this.socketLinks)
            {
                if(eventTarget_socketType == 'input' && this.activeSocketLinks.indexOf($link.$inputSocket) > -1)
                {if(this.activeSocketLinks.indexOf($link.$outputSocket) == -1)
                    {
                        $connectedSockets.push($link.$outputSocket);
                        linksToRemove.push($link);
                    }
                }
                else if (eventTarget_socketType == 'output' && this.activeSocketLinks.indexOf($link.$outputSocket) > -1)
                {
                    if(this.activeSocketLinks.indexOf($link.$inputSocket) == -1)
                    {
                        $connectedSockets.push($link.$inputSocket);
                        linksToRemove.push($link);
                    }
                }
            }

            for(let i = 0; i < linksToRemove.length; i++)
            {
                linksToRemove[i].remove();
                this.socketLinks.splice(this.socketLinks.indexOf(linksToRemove[i]), 1);
            }

            this.activeSocketLinks = $connectedSockets;
            for(let $linkedSocket of $connectedSockets)
            {
                this.initLinkPreview($linkedSocket);
                let socketType = $linkedSocket.getSocketType();
                // add listeners to opposite sockets
                for(let $socket of this.querySelectorAll(`.${(socketType == 'output') ? 'input' : 'output'}s node-graph-socket`))
                {
                    if($connectedSockets.indexOf($socket) == -1)
                    {
                        $socket.addEventListener('mouseenter', this.boundHandlers.socket_onMouseEnter);
                        $socket.addEventListener('mouseleave', this.boundHandlers.socket_onMouseOut);
                    }
                }
                this.updateLink($linkedSocket, mouseEvent.clientX, mouseEvent.clientY);
            }
        }
        else
        {
            this.initLinkPreview(this.activeSocketLinks[0]);
            
            // add listeners to opposite sockets
            for(let $socket of this.querySelectorAll(`.${(eventTarget_socketType == 'output') ? 'input' : 'output'}s node-graph-socket`))
            {
                if($socket != this.activeSocketLinks[0])
                {
                    $socket.addEventListener('mouseenter', this.boundHandlers.socket_onMouseEnter);
                    $socket.addEventListener('mouseleave', this.boundHandlers.socket_onMouseOut);
                }
            }
            this.updateLink(this.activeSocketLinks[0], mouseEvent.clientX, mouseEvent.clientY);
        }


        document.addEventListener('mousemove', this.boundHandlers.socket_documentOnMouseMove);
    }
    socket_document_onMouseMove(event)
    {
        for(let i = 0; i < this.activeSocketLinks.length; i++)
        {
            this.updateLink(this.activeSocketLinks[i], event.clientX, event.clientY);
        }
    }
    socket_onMouseEnter(event)
    {
        this.$connectionTargetSocket = event.currentTarget.closest(SOCKET_TAG_NAME);
        this.$connectionTargetSocket.classList.add('target');
    }
    socket_onMouseOut(event)
    {
        event.currentTarget.closest(SOCKET_TAG_NAME).classList.remove('target');
        this.$connectionTargetSocket = null;
    }
    socket_onEndSocketConnection(event)
    {
        this.style.cursor = 'grab';
        this.style.removeProperty('user-select');

        for(let i = 0; i < this.activeSocketLinks.length; i++)
        {
            this.activeSocketLinks[i].$linkPreview?.remove();

            if(this.$connectionTargetSocket != null)
            {
                let previewFromSocketType = this.activeSocketLinks[i].getSocketType();
                if(previewFromSocketType == "input")
                {
                    this.linkSockets(this.$connectionTargetSocket, this.activeSocketLinks[i]);
                }
                else if (previewFromSocketType == "output")
                {
                    this.linkSockets(this.activeSocketLinks[i], this.$connectionTargetSocket);
                }
            }
        }

        // remove listeners from other sockets
        for(let $socket of this.querySelectorAll(SOCKET_TAG_NAME))
        {
            $socket.removeEventListener('mouseenter', this.boundHandlers.socket_onMouseEnter);
            $socket.removeEventListener('mouseleave', this.boundHandlers.socket_onMouseOut);
            $socket.classList.remove('target');
        }

        document.removeEventListener('mousemove', this.boundHandlers.socket_documentOnMouseMove);

        this.$connectionTargetSocket = null;
        this.activeSocketLinks = [];
        this.classList.remove('linking');
    }

    getLinkStartingPosition($socket)
    {
        let portRect = $socket.$port.getBoundingClientRect();
        let startX = portRect.left + (portRect.width / 2) + this.scrollLeft - this.offsetLeft;
        let startY = portRect.top + (portRect.height / 2) + this.scrollTop - this.offsetTop;
        return {x: startX, y: startY};
    }
    initLinkPreview($socket)
    {
        if($socket.$linkPreview == null)
        {
            $socket.$linkPreview = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            $socket.$linkPreview.$path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            $socket.$linkPreview.$pointA = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            $socket.$linkPreview.$pointB = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          
            $socket.$linkPreview.setAttribute('fill', 'none');
            $socket.$linkPreview.setAttribute('viewBox', `0 0 ${SVG_OFFSET} ${SVG_OFFSET}`);
            $socket.$linkPreview.setAttribute('stroke', 'white');
            $socket.$linkPreview.classList.add('link');
          
            $socket.$linkPreview.$path.setAttribute('stroke-linecap', 'round');
            $socket.$linkPreview.$path.setAttribute('stroke-linejoin', 'round');
            $socket.$linkPreview.$path.setAttribute('stroke-width', '2');
            
            $socket.$linkPreview.$pointA.setAttribute('r', '2');
            $socket.$linkPreview.$pointB.setAttribute('r', '2');
          
            $socket.$linkPreview.appendChild($socket.$linkPreview.$path);
            $socket.$linkPreview.appendChild($socket.$linkPreview.$pointA);
            $socket.$linkPreview.appendChild($socket.$linkPreview.$pointB);
        }

        let portRect = this.getLinkStartingPosition($socket);
        $socket.$linkPreview.style.setProperty('--top', `${portRect.y - SVG_OFFSET / 2}px`);
        $socket.$linkPreview.style.setProperty('--left', `${portRect.x - SVG_OFFSET / 2}px`);
        this.$canvas.appendChild($socket.$linkPreview);
    }
    updateLink($socket, mouseX, mouseY)
    {

        let socketType = $socket.getSocketType();
        if(socketType == null)
        {
            return;
        }
        else
        {
            let portRect = this.getLinkStartingPosition($socket);
            let mouseRelativeX = (mouseX + this.scrollLeft - this.offsetLeft) - portRect.x;
            let mouseRelativeY = (mouseY + this.scrollTop - this.offsetTop) - portRect.y;
            if(socketType == 'input')
            {


                let startX = mouseRelativeX + SVG_OFFSET / 2;
                let startY = mouseRelativeY + SVG_OFFSET / 2;
                let endX = SVG_OFFSET / 2;
                let endY = SVG_OFFSET / 2;
        
                let { pathValue, AX, AY, FX, FY } = this.calculateLinkPath(startX, startY, endX, endY);
                $socket.$linkPreview.$path.setAttribute('d', pathValue);
                $socket.$linkPreview.$pointA.setAttribute("cx", AX);
                $socket.$linkPreview.$pointA.setAttribute("cy", AY);
                $socket.$linkPreview.$pointB.setAttribute("cx", FX);
                $socket.$linkPreview.$pointB.setAttribute("cy", FY);
            }
            else if(socketType == 'output')
            {

                let startX = SVG_OFFSET / 2;
                let startY = SVG_OFFSET / 2;
                let endX = mouseRelativeX + SVG_OFFSET / 2;
                let endY = mouseRelativeY + SVG_OFFSET / 2;
        
                let { pathValue, AX, AY, FX, FY } = this.calculateLinkPath(startX, startY, endX, endY);
                $socket.$linkPreview.$path.setAttribute('d', pathValue);
                $socket.$linkPreview.$pointA.setAttribute("cx", AX);
                $socket.$linkPreview.$pointA.setAttribute("cy", AY);
                $socket.$linkPreview.$pointB.setAttribute("cx", FX);
                $socket.$linkPreview.$pointB.setAttribute("cy", FY);
            }
        }
    }
    calculateLinkPathFromSockets($fromSocket, $toSocket)
    {
        let startX = SVG_OFFSET / 2;
        let startY = SVG_OFFSET / 2;
        let startPortRect = this.getLinkStartingPosition($fromSocket);
        let endPortRect = this.getLinkStartingPosition($toSocket);
        let endX = startX + endPortRect.x - startPortRect.x;
        let endY = startY + endPortRect.y - startPortRect.y;
        
        return this.calculateLinkPath(startX, startY, endX, endY);
    }
    calculateLinkPath(startX, startY, endX, endY)
    {
        // M
        var AX = startX;
        var AY = startY;

        // L
        var BX = Math.abs(endX - startX) * 0.05 + startX;
        var BY = startY;
    
        // C
        var CX = startX + Math.abs(endX - startX) * 0.33;
        var CY = startY;
        var DX = endX - Math.abs(endX - startX) * 0.33;
        var DY = endY;
        var EX = - Math.abs(endX - startX) * 0.05 + endX;
        var EY = endY;

        // L
        var FX = endX;
        var FY = endY;

        // setting up the path string
        var path = 'M' + AX + ',' + AY;
        path += ' L' + BX + ',' + BY;
        path +=  ' ' + 'C' + CX + ',' + CY;
        path += ' ' + DX + ',' + DY;
        path += ' ' + EX + ',' + EY;
        path += ' L' + FX + ',' + FY;

        return  {
            pathValue: path,
            AX,
            AY,
            BX,
            BY,
            CX,
            CY,
            DX,
            DY,
            EX,
            EY,
            FX,
            FY
        };
    }
    // End Sockets

    // Nodes
    addNode(x, y, template)
    {
        let $node = document.createElement(NODE_TAG_NAME);

        if(template != null)
        {
            $node.setAttribute('template', template);
        }
        this.$canvas.appendChild($node);
        $node.style.setProperty('--top', `${y}px`);
        $node.style.setProperty('--left', `${x}px`);

        $node.addEventListener('onuserselected', (event) =>
        {
            let mouseEvent = event.detail.mouseEvent;
            if(mouseEvent.shiftKey)
            {
                event.currentTarget.classList.add('selected');
                return;
            }

            let previouslySelected = this.$canvas.querySelectorAll('node-graph-node.selected');

            if(event.currentTarget.classList.contains('selected'))
            {
                if(previouslySelected.length > 1)
                {
                    for(let $node of previouslySelected)
                    {
                        if($node != event.currentTarget)
                        {
                            $node.classList.remove('selected');
                        }
                    }
                }
                else
                {
                    for(let $node of previouslySelected)
                    {
                        $node.classList.remove('selected');
                    }
                }
            }
            else
            {
                for(let $node of previouslySelected)
                {
                    $node.classList.remove('selected');
                }
                event.currentTarget.classList.add('selected');
            }
        });
        $node.addEventListener('onnodemove', (event) =>
        {
            this.updateNodeLinks(event.currentTarget);

            let previouslySelected = this.$canvas.querySelectorAll('node-graph-node.selected');
            if([...previouslySelected].indexOf(event.currentTarget) == -1)
            {
                return;
            }
            for(let $node of previouslySelected)
            {
                if($node != event.currentTarget)
                {
                    $node.style.setProperty('--top', `${$node.offsetTop + event.detail.deltaY}px`);
                    $node.style.setProperty('--left', `${$node.offsetLeft + event.detail.deltaX}px`);
                    this.updateNodeLinks($node);
                }
            }
        });

        for(let $socket of $node.querySelectorAll(SOCKET_TAG_NAME))
        {
            this.registerNodeSocket($socket);
        }

        return $node;
    }
    removeNodeById(nodeId)
    {
        this.removeNode(this.$canvas.querySelector(`node-graph-node[data-node-id="${nodeId}"]`));
    }
    removeNode($node)
    {
        if($node == null)
        {
            return;
        }
        $node.remove();

        const toRemove = [];
        for(let $link of this.socketLinks)
        {
            if($link.$outputSocket.closest(NODE_TAG_NAME) == $node || $link.$inputSocket.closest(NODE_TAG_NAME) == $node)
            {
                toRemove.push($link);
            }
        }

        for(let $link of toRemove)
        {
            $link.remove();
            this.socketLinks.splice(this.socketLinks.indexOf($link), 1);
        }
    }
    linkSockets($outputSocket, $inputSocket)
    {
        const $link = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        $link.$path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        $link.$pointA = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        $link.$pointB = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        $link.$outputSocket = $outputSocket;
        $link.$inputSocket = $inputSocket;
      
        $link.setAttribute('fill', 'none');
        $link.setAttribute('viewBox', `0 0 ${SVG_OFFSET} ${SVG_OFFSET}`);
        $link.setAttribute('stroke', 'white');
        $link.classList.add('link');
      
        $link.$path.setAttribute('stroke-linecap', 'round');
        $link.$path.setAttribute('stroke-linejoin', 'round');
        $link.$path.setAttribute('stroke-width', '2');
        
        $link.$pointA.setAttribute('r', '2');
        $link.$pointB.setAttribute('r', '2');
      
        $link.appendChild($link.$path);
        $link.appendChild($link.$pointA);
        $link.appendChild($link.$pointB);

        let startPortRect = this.getLinkStartingPosition($outputSocket);
        $link.style.setProperty('--top', `${startPortRect.y - SVG_OFFSET / 2}px`);
        $link.style.setProperty('--left', `${startPortRect.x - SVG_OFFSET / 2}px`);
        this.$canvas.appendChild($link);
        let { pathValue, AX, AY, FX, FY } = this.calculateLinkPathFromSockets($outputSocket, $inputSocket);
        $link.$path.setAttribute('d', pathValue);
        $link.$pointA.setAttribute("cx", AX);
        $link.$pointA.setAttribute("cy", AY);
        $link.$pointB.setAttribute("cx", FX);
        $link.$pointB.setAttribute("cy", FY);

        this.socketLinks.push($link);
    }
    updateNodeLinks($node)
    {
        for(let $link of this.socketLinks)
        {
            if($node == $link.$outputSocket.closest(NODE_TAG_NAME) || $node == $link.$inputSocket.closest(NODE_TAG_NAME))
            {
                let startPortRect = this.getLinkStartingPosition($link.$outputSocket);
                $link.style.setProperty('--top', `${startPortRect.y - SVG_OFFSET / 2}px`);
                $link.style.setProperty('--left', `${startPortRect.x - SVG_OFFSET / 2}px`);
                let { pathValue, AX, AY, FX, FY } = this.calculateLinkPathFromSockets($link.$outputSocket, $link.$inputSocket);
                $link.$path.setAttribute('d', pathValue);
                $link.$pointA.setAttribute("cx", AX);
                $link.$pointA.setAttribute("cy", AY);
                $link.$pointB.setAttribute("cx", FX);
                $link.$pointB.setAttribute("cy", FY);
            }
        }
    }

    copyNodes()
    {

    }
    pasteNodes()
    {

    }

    registerNodeSocket($socket)
    {
        $socket.addEventListener('onstartlinkconnection', (event) => {this.socket_onStartSocketConnection(event);});
        $socket.addEventListener('onendlinkconnection', (event) => {this.socket_onEndSocketConnection(event);});
    }
    // End Nodes

    getRelativePosition(mouseClientX, mouseClientY)
    {
        // Get the target
        const target = this.$canvas;

        // Get the bounding rectangle of target
        const rect = target.getBoundingClientRect();

        // Mouse position
        const x = mouseClientX - rect.left;
        const y = mouseClientY- rect.top;
        return { x, y };
    }
}


export class MagnitNodeGraphNode extends BaseComponent()
{
    static get observedAttributes() { return ['template']; }
    static register() { if(!customElements.get(NODE_TAG_NAME)) { customElements.define(NODE_TAG_NAME, MagnitNodeGraphNode); } }

    constructor()
    {
        super();
        this.recordId = crypto.randomUUID();
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
            this.registerStyle();

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

        let $newSocket = document.createElement(SOCKET_TAG_NAME);
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

        this.closest(GRAPH_TAG_NAME)?.registerNodeSocket($newSocket);

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


export class MagnitNodeGraphSocket extends BaseComponent()
{
    static get observedAttributes() { return ['label']; }
    static register() { if(!customElements.get(SOCKET_TAG_NAME)) { customElements.define(SOCKET_TAG_NAME, MagnitNodeGraphSocket); } }

    constructor()
    {
        super();
        this.recordId = crypto.randomUUID();
        this.addEventListener('onconnect', () =>
        {
            this.cursorPosition = { top: 0, left: 0, x: 0, y: 0 };
            this.boundHandlers =
            {
                documentConnectionOnMouseUp: this.document_connection_onMouseUp.bind(this)
            };

            this.attachDOM(SOCKET_DEFAULT_CONTENT_TEMPLATE);
            this.registerStyle();

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
}

MagnitNodeGraph.register();
MagnitNodeGraphNode.register();
MagnitNodeGraphSocket.register();