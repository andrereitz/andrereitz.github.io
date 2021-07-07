
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    // Track which nodes are claimed during hydration. Unclaimed nodes can then be removed from the DOM
    // at the end of hydration without touching the remaining nodes.
    let is_hydrating = false;
    function start_hydrating() {
        is_hydrating = true;
    }
    function end_hydrating() {
        is_hydrating = false;
    }
    function upper_bound(low, high, key, value) {
        // Return first index of value larger than input value in the range [low, high)
        while (low < high) {
            const mid = low + ((high - low) >> 1);
            if (key(mid) <= value) {
                low = mid + 1;
            }
            else {
                high = mid;
            }
        }
        return low;
    }
    function init_hydrate(target) {
        if (target.hydrate_init)
            return;
        target.hydrate_init = true;
        // We know that all children have claim_order values since the unclaimed have been detached
        const children = target.childNodes;
        /*
        * Reorder claimed children optimally.
        * We can reorder claimed children optimally by finding the longest subsequence of
        * nodes that are already claimed in order and only moving the rest. The longest
        * subsequence subsequence of nodes that are claimed in order can be found by
        * computing the longest increasing subsequence of .claim_order values.
        *
        * This algorithm is optimal in generating the least amount of reorder operations
        * possible.
        *
        * Proof:
        * We know that, given a set of reordering operations, the nodes that do not move
        * always form an increasing subsequence, since they do not move among each other
        * meaning that they must be already ordered among each other. Thus, the maximal
        * set of nodes that do not move form a longest increasing subsequence.
        */
        // Compute longest increasing subsequence
        // m: subsequence length j => index k of smallest value that ends an increasing subsequence of length j
        const m = new Int32Array(children.length + 1);
        // Predecessor indices + 1
        const p = new Int32Array(children.length);
        m[0] = -1;
        let longest = 0;
        for (let i = 0; i < children.length; i++) {
            const current = children[i].claim_order;
            // Find the largest subsequence length such that it ends in a value less than our current value
            // upper_bound returns first greater value, so we subtract one
            const seqLen = upper_bound(1, longest + 1, idx => children[m[idx]].claim_order, current) - 1;
            p[i] = m[seqLen] + 1;
            const newLen = seqLen + 1;
            // We can guarantee that current is the smallest value. Otherwise, we would have generated a longer sequence.
            m[newLen] = i;
            longest = Math.max(newLen, longest);
        }
        // The longest increasing subsequence of nodes (initially reversed)
        const lis = [];
        // The rest of the nodes, nodes that will be moved
        const toMove = [];
        let last = children.length - 1;
        for (let cur = m[longest] + 1; cur != 0; cur = p[cur - 1]) {
            lis.push(children[cur - 1]);
            for (; last >= cur; last--) {
                toMove.push(children[last]);
            }
            last--;
        }
        for (; last >= 0; last--) {
            toMove.push(children[last]);
        }
        lis.reverse();
        // We sort the nodes being moved to guarantee that their insertion order matches the claim order
        toMove.sort((a, b) => a.claim_order - b.claim_order);
        // Finally, we move the nodes
        for (let i = 0, j = 0; i < toMove.length; i++) {
            while (j < lis.length && toMove[i].claim_order >= lis[j].claim_order) {
                j++;
            }
            const anchor = j < lis.length ? lis[j] : null;
            target.insertBefore(toMove[i], anchor);
        }
    }
    function append(target, node) {
        if (is_hydrating) {
            init_hydrate(target);
            if ((target.actual_end_child === undefined) || ((target.actual_end_child !== null) && (target.actual_end_child.parentElement !== target))) {
                target.actual_end_child = target.firstChild;
            }
            if (node !== target.actual_end_child) {
                target.insertBefore(node, target.actual_end_child);
            }
            else {
                target.actual_end_child = node.nextSibling;
            }
        }
        else if (node.parentNode !== target) {
            target.appendChild(node);
        }
    }
    function insert(target, node, anchor) {
        if (is_hydrating && !anchor) {
            append(target, node);
        }
        else if (node.parentNode !== target || (anchor && node.nextSibling !== anchor)) {
            target.insertBefore(node, anchor || null);
        }
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    // unfortunately this can't be a constant as that wouldn't be tree-shakeable
    // so we cache the result instead
    let crossorigin;
    function is_crossorigin() {
        if (crossorigin === undefined) {
            crossorigin = false;
            try {
                if (typeof window !== 'undefined' && window.parent) {
                    void window.parent.document;
                }
            }
            catch (error) {
                crossorigin = true;
            }
        }
        return crossorigin;
    }
    function add_resize_listener(node, fn) {
        const computed_style = getComputedStyle(node);
        if (computed_style.position === 'static') {
            node.style.position = 'relative';
        }
        const iframe = element('iframe');
        iframe.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; ' +
            'overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: -1;');
        iframe.setAttribute('aria-hidden', 'true');
        iframe.tabIndex = -1;
        const crossorigin = is_crossorigin();
        let unsubscribe;
        if (crossorigin) {
            iframe.src = "data:text/html,<script>onresize=function(){parent.postMessage(0,'*')}</script>";
            unsubscribe = listen(window, 'message', (event) => {
                if (event.source === iframe.contentWindow)
                    fn();
            });
        }
        else {
            iframe.src = 'about:blank';
            iframe.onload = () => {
                unsubscribe = listen(iframe.contentWindow, 'resize', fn);
            };
        }
        append(node, iframe);
        return () => {
            if (crossorigin) {
                unsubscribe();
            }
            else if (unsubscribe && iframe.contentWindow) {
                unsubscribe();
            }
            detach(iframe);
        };
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                start_hydrating();
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            end_hydrating();
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.38.3' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const globalSizes = writable({
        heroH: null,
        navbarH: null
    });

    const logo = `<svg class="logo" width="100%" viewBox="0 0 330 50" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M23.0603 20.2412L8.33148 50H0L2.97553 44.4946L19.6385 12.8015H27.0773L44.0378 44.941L87.6293 47.7681L38.0868 50L23.0603 20.2412Z" fill="white"/>
<path d="M46.8646 42.1144V12.802H73.4955C75.5288 12.7028 79.5954 13.8436 79.5954 19.2002V26.1935C79.4962 27.8798 77.9588 31.6989 72.7517 31.2525L81.0831 42.1144H72.4541L64.8665 31.9964V26.1935H70.52C71.5912 26.1935 71.9582 25.3007 72.0078 24.8543V20.2417C72.0078 19.0514 71.0159 18.4562 70.52 18.3074H54.6009V26.1935V31.9964V42.1144H46.8646Z" fill="white"/>
<path d="M0 0L83.4035 7.5323L90.1585 47.3164V0H0Z" fill="white"/>
<path d="M124.716 10.3165H134.327L146.164 43.1493H138.172L135.238 34.4985H123.249L120.366 43.1493H112.576L124.716 10.3165ZM133.518 29.2371L129.37 16.8932H129.168L125.02 29.2371H133.518Z" fill="white"/>
<path d="M145.656 18.6638H150.209V21.6486C150.681 19.3215 153.362 18.1579 158.252 18.1579C161.388 18.1579 163.58 18.7313 164.828 19.878C166.109 20.9909 166.75 22.7616 166.75 25.1899V43.1493H162.197V25.4429C162.197 24.8021 162.147 24.2793 162.046 23.8746C161.945 23.4699 161.742 23.0651 161.439 22.6604C160.764 21.8172 159.264 21.3957 156.937 21.3957C155.149 21.3957 153.767 21.5306 152.789 21.8004C151.845 22.0365 151.17 22.4412 150.765 23.0145C150.395 23.5879 150.209 24.3973 150.209 25.4429V43.1493H145.656V18.6638Z" fill="white"/>
<path d="M178.852 43.6552C176.424 43.6552 174.518 43.4191 173.136 42.947C171.753 42.4411 170.742 41.6316 170.101 40.5187C169.494 39.4057 169.19 37.8542 169.19 35.8644V25.0887C169.19 22.6267 169.949 20.856 171.467 19.7768C173.018 18.6975 175.564 18.1579 179.105 18.1579C181.229 18.1579 183.05 18.4277 184.568 18.9674C186.119 19.507 186.912 20.2827 186.945 21.2945H187.046L186.945 15.0719V7.73639H191.498V43.1493H187.046V40.2657C187.046 41.1763 186.321 41.952 184.871 42.5928C183.421 43.3011 181.415 43.6552 178.852 43.6552ZM179.813 40.5187C182.342 40.5187 184.163 40.232 185.276 39.6586C186.389 39.0853 186.945 38.1072 186.945 36.7244V24.6334C186.945 22.4412 184.703 21.3451 180.218 21.3451C177.52 21.3451 175.766 21.5474 174.957 21.9522C174.114 22.3569 173.692 23.2506 173.692 24.6334V36.7244C173.692 38.1072 174.148 39.0853 175.058 39.6586C176.002 40.232 177.587 40.5187 179.813 40.5187Z" fill="white"/>
<path d="M194.446 18.6638H198.746V22.6604C198.746 21.8847 199.083 21.1596 199.758 20.485C200.432 19.7768 201.292 19.2203 202.337 18.8156C203.383 18.3771 204.411 18.1579 205.423 18.1579H207.649V22.0533H205.12C202.961 22.0533 201.393 22.34 200.415 22.9134C199.471 23.453 198.999 24.4479 198.999 25.8982V43.1493H194.446V18.6638Z" fill="white"/>
<path d="M217.947 43.6552C210.461 43.6552 206.717 41.1595 206.717 36.1679V26.5052C206.717 23.5373 207.56 21.4125 209.246 20.1309C210.966 18.8156 213.732 18.1579 217.542 18.1579C221.151 18.1579 223.747 18.7819 225.332 20.0297C226.951 21.2776 227.76 23.4361 227.76 26.5052V31.9184H211.32V35.6114C211.32 37.2978 211.911 38.5119 213.091 39.2539C214.271 39.9959 216.092 40.3669 218.554 40.3669C220.881 40.3669 223.629 39.9622 226.799 39.1527V42.6434C223.697 43.318 220.746 43.6552 217.947 43.6552ZM223.208 28.9336V25.0887C223.208 23.6048 222.752 22.593 221.842 22.0533C220.965 21.48 219.448 21.1933 217.289 21.1933C215.199 21.1933 213.681 21.48 212.737 22.0533C211.793 22.593 211.32 23.6048 211.32 25.0887V28.9336H223.208Z" fill="white"/>
<path d="M236.846 10.3165H251.617C256.001 10.3165 259.171 10.8561 261.127 11.9354C263.083 12.9809 264.061 14.7515 264.061 17.2473V23.0145C264.061 24.937 263.369 26.4547 261.987 27.5676C260.638 28.6469 258.834 29.3383 256.574 29.6418L266.084 43.1493H256.979L248.38 30.2489H244.737V43.1493H236.846V10.3165ZM251.516 25.0381C253.37 25.0381 254.635 24.8021 255.31 24.3299C255.984 23.824 256.321 22.8628 256.321 21.4463V19.1191C256.321 17.905 255.95 17.0787 255.208 16.6402C254.5 16.168 253.269 15.932 251.516 15.932H244.737V25.0381H251.516Z" fill="white"/>
<path d="M276.806 43.6552C269.32 43.6552 265.576 41.1595 265.576 36.1679V26.5052C265.576 23.5373 266.42 21.4125 268.106 20.1309C269.826 18.8156 272.591 18.1579 276.401 18.1579C280.01 18.1579 282.606 18.7819 284.191 20.0297C285.81 21.2776 286.619 23.4361 286.619 26.5052V31.9184H270.18V35.6114C270.18 37.2978 270.77 38.5119 271.95 39.2539C273.13 39.9959 274.951 40.3669 277.413 40.3669C279.74 40.3669 282.488 39.9622 285.658 39.1527V42.6434C282.556 43.318 279.605 43.6552 276.806 43.6552ZM282.067 28.9336V25.0887C282.067 23.6048 281.612 22.593 280.701 22.0533C279.824 21.48 278.307 21.1933 276.149 21.1933C274.058 21.1933 272.54 21.48 271.596 22.0533C270.652 22.593 270.18 23.6048 270.18 25.0887V28.9336H282.067Z" fill="white"/>
<path d="M289.005 9.81058H293.557V14.566H289.005V9.81058ZM289.005 18.6638H293.557V43.1493H289.005V18.6638Z" fill="white"/>
<path d="M307.169 43.6552C305.078 43.6552 303.443 43.436 302.263 42.9976C301.082 42.5254 300.222 41.7497 299.683 40.6704C299.177 39.5574 298.924 38.006 298.924 36.0161V21.6486H293.461V18.6638H298.924V11.0753H303.527V18.6638H312.278V21.6486H303.527V36.2691C303.527 37.4833 303.662 38.3939 303.932 39.001C304.235 39.608 304.741 40.0465 305.449 40.3163C306.191 40.5524 307.253 40.6704 308.636 40.6704C309.075 40.6704 310.289 40.5355 312.278 40.2657V43.2505C310.558 43.5203 308.855 43.6552 307.169 43.6552Z" fill="white"/>
<path d="M310.778 40.0633L324.537 21.7498H311.284V18.6638H329.696V21.7498L315.938 40.0633H330V43.1493H310.778V40.0633Z" fill="white"/>
</svg>`;

    /* src/Hero.svelte generated by Svelte v3.38.3 */
    const file$6 = "src/Hero.svelte";

    // (33:12) {#if windowW > 1024}
    function create_if_block(ctx) {
    	let i;

    	const block = {
    		c: function create() {
    			i = element("i");
    			attr_dev(i, "class", "watermark fab fa-github svelte-js01w");
    			set_style(i, "opacity", 1 - Math.max(0, /*scrollY*/ ctx[1] / (/*$globalSizes*/ ctx[2].heroH - 100)));
    			set_style(i, "transform", "translate(0," + /*scrollY*/ ctx[1] * 0.2 + "px) rotate(" + (-25 - /*scrollY*/ ctx[1] / 50) + "deg)");
    			add_location(i, file$6, 33, 16, 1330);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*scrollY, $globalSizes*/ 6) {
    				set_style(i, "opacity", 1 - Math.max(0, /*scrollY*/ ctx[1] / (/*$globalSizes*/ ctx[2].heroH - 100)));
    			}

    			if (dirty & /*scrollY*/ 2) {
    				set_style(i, "transform", "translate(0," + /*scrollY*/ ctx[1] * 0.2 + "px) rotate(" + (-25 - /*scrollY*/ ctx[1] / 50) + "deg)");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(33:12) {#if windowW > 1024}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let scrolling = false;

    	let clear_scrolling = () => {
    		scrolling = false;
    	};

    	let scrolling_timeout;
    	let div2;
    	let div1;
    	let header;
    	let span;
    	let t0;
    	let div0;
    	let h1;
    	let t2;
    	let p0;
    	let t4;
    	let h2;
    	let t6;
    	let p1;
    	let t8;
    	let p2;
    	let t10;
    	let p3;
    	let t12;
    	let t13;
    	let i;
    	let div2_resize_listener;
    	let mounted;
    	let dispose;
    	add_render_callback(/*onwindowresize*/ ctx[3]);
    	add_render_callback(/*onwindowscroll*/ ctx[4]);
    	let if_block = /*windowW*/ ctx[0] > 1024 && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			header = element("header");
    			span = element("span");
    			t0 = space();
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Welcome to my Github root";
    			t2 = space();
    			p0 = element("p");
    			p0.textContent = "Here you will find some of my recent studies and tests both on frontend and backend engineering, hosted in public and private repositories.";
    			t4 = space();
    			h2 = element("h2");
    			h2.textContent = "About Me";
    			t6 = space();
    			p1 = element("p");
    			p1.textContent = "I’m a Frontend Engineer from São Paulo, Brazil.";
    			t8 = space();
    			p2 = element("p");
    			p2.textContent = "After working as a Designer and Fullstack Engineer for more then ten years I took some time off from the market to go after my personal ventures.";
    			t10 = space();
    			p3 = element("p");
    			p3.textContent = "Today I’m a specialized Frontend engineer at Encora, I have worked with brands like Dufry Duty Free, Raiadrogasil and others in the past 3 years.";
    			t12 = space();
    			if (if_block) if_block.c();
    			t13 = space();
    			i = element("i");
    			attr_dev(span, "class", "logo svelte-js01w");
    			set_style(span, "opacity", 1 - Math.max(0, /*scrollY*/ ctx[1] / 100));
    			set_style(span, "transform", "translate(0," + /*scrollY*/ ctx[1] * 0.4 + "px)");
    			add_location(span, file$6, 13, 12, 319);
    			attr_dev(header, "class", "svelte-js01w");
    			add_location(header, file$6, 12, 8, 298);
    			attr_dev(h1, "class", "svelte-js01w");
    			add_location(h1, file$6, 18, 12, 540);
    			attr_dev(p0, "class", "svelte-js01w");
    			add_location(p0, file$6, 19, 12, 587);
    			attr_dev(h2, "class", "svelte-js01w");
    			add_location(h2, file$6, 22, 12, 776);
    			attr_dev(p1, "class", "svelte-js01w");
    			add_location(p1, file$6, 23, 12, 806);
    			attr_dev(p2, "class", "svelte-js01w");
    			add_location(p2, file$6, 26, 12, 903);
    			attr_dev(p3, "class", "svelte-js01w");
    			add_location(p3, file$6, 29, 12, 1098);
    			attr_dev(div0, "class", "content svelte-js01w");
    			add_location(div0, file$6, 17, 8, 506);
    			attr_dev(i, "class", "fas fa-user");
    			add_location(i, file$6, 39, 8, 1619);
    			attr_dev(div1, "class", "container");
    			add_location(div1, file$6, 11, 4, 266);
    			attr_dev(div2, "class", "row hero svelte-js01w");
    			add_render_callback(() => /*div2_elementresize_handler*/ ctx[5].call(div2));
    			add_location(div2, file$6, 10, 0, 200);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, header);
    			append_dev(header, span);
    			span.innerHTML = logo;
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, h1);
    			append_dev(div0, t2);
    			append_dev(div0, p0);
    			append_dev(div0, t4);
    			append_dev(div0, h2);
    			append_dev(div0, t6);
    			append_dev(div0, p1);
    			append_dev(div0, t8);
    			append_dev(div0, p2);
    			append_dev(div0, t10);
    			append_dev(div0, p3);
    			append_dev(div0, t12);
    			if (if_block) if_block.m(div0, null);
    			append_dev(div1, t13);
    			append_dev(div1, i);
    			div2_resize_listener = add_resize_listener(div2, /*div2_elementresize_handler*/ ctx[5].bind(div2));

    			if (!mounted) {
    				dispose = [
    					listen_dev(window, "resize", /*onwindowresize*/ ctx[3]),
    					listen_dev(window, "scroll", () => {
    						scrolling = true;
    						clearTimeout(scrolling_timeout);
    						scrolling_timeout = setTimeout(clear_scrolling, 100);
    						/*onwindowscroll*/ ctx[4]();
    					})
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*scrollY*/ 2 && !scrolling) {
    				scrolling = true;
    				clearTimeout(scrolling_timeout);
    				scrollTo(window.pageXOffset, /*scrollY*/ ctx[1]);
    				scrolling_timeout = setTimeout(clear_scrolling, 100);
    			}

    			if (dirty & /*scrollY*/ 2) {
    				set_style(span, "opacity", 1 - Math.max(0, /*scrollY*/ ctx[1] / 100));
    			}

    			if (dirty & /*scrollY*/ 2) {
    				set_style(span, "transform", "translate(0," + /*scrollY*/ ctx[1] * 0.4 + "px)");
    			}

    			if (/*windowW*/ ctx[0] > 1024) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(div0, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (if_block) if_block.d();
    			div2_resize_listener();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let $globalSizes;
    	validate_store(globalSizes, "globalSizes");
    	component_subscribe($$self, globalSizes, $$value => $$invalidate(2, $globalSizes = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Hero", slots, []);
    	let windowW;
    	let scrollY;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Hero> was created with unknown prop '${key}'`);
    	});

    	function onwindowresize() {
    		$$invalidate(0, windowW = window.innerWidth);
    	}

    	function onwindowscroll() {
    		$$invalidate(1, scrollY = window.pageYOffset);
    	}

    	function div2_elementresize_handler() {
    		$globalSizes.heroH = this.clientHeight;
    		globalSizes.set($globalSizes);
    	}

    	$$self.$capture_state = () => ({
    		globalSizes,
    		logo,
    		windowW,
    		scrollY,
    		$globalSizes
    	});

    	$$self.$inject_state = $$props => {
    		if ("windowW" in $$props) $$invalidate(0, windowW = $$props.windowW);
    		if ("scrollY" in $$props) $$invalidate(1, scrollY = $$props.scrollY);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		windowW,
    		scrollY,
    		$globalSizes,
    		onwindowresize,
    		onwindowscroll,
    		div2_elementresize_handler
    	];
    }

    class Hero extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Hero",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    function cubicInOut(t) {
        return t < 0.5 ? 4.0 * t * t * t : 0.5 * Math.pow(2.0 * t - 2.0, 3.0) + 1.0;
    }

    var _ = {
      $(selector) {
        if (typeof selector === "string") {
          return document.querySelector(selector);
        }
        return selector;
      },
      extend(...args) {
        return Object.assign(...args);
      },
      cumulativeOffset(element) {
        let top = 0;
        let left = 0;

        do {
          top += element.offsetTop || 0;
          left += element.offsetLeft || 0;
          element = element.offsetParent;
        } while (element);

        return {
          top: top,
          left: left
        };
      },
      directScroll(element) {
        return element && element !== document && element !== document.body;
      },
      scrollTop(element, value) {
        let inSetter = value !== undefined;
        if (this.directScroll(element)) {
          return inSetter ? (element.scrollTop = value) : element.scrollTop;
        } else {
          return inSetter
            ? (document.documentElement.scrollTop = document.body.scrollTop = value)
            : window.pageYOffset ||
                document.documentElement.scrollTop ||
                document.body.scrollTop ||
                0;
        }
      },
      scrollLeft(element, value) {
        let inSetter = value !== undefined;
        if (this.directScroll(element)) {
          return inSetter ? (element.scrollLeft = value) : element.scrollLeft;
        } else {
          return inSetter
            ? (document.documentElement.scrollLeft = document.body.scrollLeft = value)
            : window.pageXOffset ||
                document.documentElement.scrollLeft ||
                document.body.scrollLeft ||
                0;
        }
      }
    };

    const defaultOptions = {
      container: "body",
      duration: 500,
      delay: 0,
      offset: 0,
      easing: cubicInOut,
      onStart: noop,
      onDone: noop,
      onAborting: noop,
      scrollX: false,
      scrollY: true
    };

    const _scrollTo = options => {
      let {
        offset,
        duration,
        delay,
        easing,
        x=0,
        y=0,
        scrollX,
        scrollY,
        onStart,
        onDone,
        container,
        onAborting,
        element
      } = options;

      if (typeof offset === "function") {
        offset = offset();
      }

      var cumulativeOffsetContainer = _.cumulativeOffset(container);
      var cumulativeOffsetTarget = element
        ? _.cumulativeOffset(element)
        : { top: y, left: x };

      var initialX = _.scrollLeft(container);
      var initialY = _.scrollTop(container);

      var targetX =
        cumulativeOffsetTarget.left - cumulativeOffsetContainer.left + offset;
      var targetY =
        cumulativeOffsetTarget.top - cumulativeOffsetContainer.top + offset;

      var diffX = targetX - initialX;
    	var diffY = targetY - initialY;

      let scrolling = true;
      let started = false;
      let start_time = now() + delay;
      let end_time = start_time + duration;

      function scrollToTopLeft(element, top, left) {
        if (scrollX) _.scrollLeft(element, left);
        if (scrollY) _.scrollTop(element, top);
      }

      function start(delayStart) {
        if (!delayStart) {
          started = true;
          onStart(element, {x, y});
        }
      }

      function tick(progress) {
        scrollToTopLeft(
          container,
          initialY + diffY * progress,
          initialX + diffX * progress
        );
      }

      function stop() {
        scrolling = false;
      }

      loop(now => {
        if (!started && now >= start_time) {
          start(false);
        }

        if (started && now >= end_time) {
          tick(1);
          stop();
          onDone(element, {x, y});
        }

        if (!scrolling) {
          onAborting(element, {x, y});
          return false;
        }
        if (started) {
          const p = now - start_time;
          const t = 0 + 1 * easing(p / duration);
          tick(t);
        }

        return true;
      });

      start(delay);

      tick(0);

      return stop;
    };

    const proceedOptions = options => {
    	let opts = _.extend({}, defaultOptions, options);
      opts.container = _.$(opts.container);
      opts.element = _.$(opts.element);
      return opts;
    };

    const scrollContainerHeight = containerElement => {
      if (
        containerElement &&
        containerElement !== document &&
        containerElement !== document.body
      ) {
        return containerElement.scrollHeight - containerElement.offsetHeight;
      } else {
        let body = document.body;
        let html = document.documentElement;

        return Math.max(
          body.scrollHeight,
          body.offsetHeight,
          html.clientHeight,
          html.scrollHeight,
          html.offsetHeight
        );
      }
    };

    const setGlobalOptions = options => {
    	_.extend(defaultOptions, options || {});
    };

    const scrollTo$1 = options => {
      return _scrollTo(proceedOptions(options));
    };

    const scrollToBottom = options => {
      options = proceedOptions(options);

      return _scrollTo(
        _.extend(options, {
          element: null,
          y: scrollContainerHeight(options.container)
        })
      );
    };

    const scrollToTop = options => {
      options = proceedOptions(options);

      return _scrollTo(
        _.extend(options, {
          element: null,
          y: 0
        })
      );
    };

    const makeScrollToAction = scrollToFunc => {
      return (node, options) => {
        let current = options;
        const handle = e => {
          e.preventDefault();
          scrollToFunc(
            typeof current === "string" ? { element: current } : current
          );
        };
        node.addEventListener("click", handle);
        node.addEventListener("touchstart", handle);
        return {
          update(options) {
            current = options;
          },
          destroy() {
            node.removeEventListener("click", handle);
            node.removeEventListener("touchstart", handle);
          }
        };
      };
    };

    const scrollto = makeScrollToAction(scrollTo$1);
    const scrolltotop = makeScrollToAction(scrollToTop);
    const scrolltobottom = makeScrollToAction(scrollToBottom);

    var animateScroll = /*#__PURE__*/Object.freeze({
        __proto__: null,
        setGlobalOptions: setGlobalOptions,
        scrollTo: scrollTo$1,
        scrollToBottom: scrollToBottom,
        scrollToTop: scrollToTop,
        makeScrollToAction: makeScrollToAction,
        scrollto: scrollto,
        scrolltotop: scrolltotop,
        scrolltobottom: scrolltobottom
    });

    /* src/Nav.svelte generated by Svelte v3.38.3 */
    const file$5 = "src/Nav.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (33:12) {#each NAV_ITEMS as item}
    function create_each_block(ctx) {
    	let li;
    	let t0_value = /*item*/ ctx[6].name + "";
    	let t0;
    	let t1;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[4](/*item*/ ctx[6]);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(li, "class", "svelte-6vryo9");
    			add_location(li, file$5, 33, 16, 779);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t0);
    			append_dev(li, t1);

    			if (!mounted) {
    				dispose = listen_dev(li, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(33:12) {#each NAV_ITEMS as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let scrolling = false;

    	let clear_scrolling = () => {
    		scrolling = false;
    	};

    	let scrolling_timeout;
    	let div;
    	let nav;
    	let ul;
    	let nav_resize_listener;
    	let div_class_value;
    	let mounted;
    	let dispose;
    	add_render_callback(/*onwindowscroll*/ ctx[3]);
    	let each_value = /*NAV_ITEMS*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			nav = element("nav");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul, "class", "svelte-6vryo9");
    			add_location(ul, file$5, 31, 8, 720);
    			attr_dev(nav, "class", "container svelte-6vryo9");
    			add_render_callback(() => /*nav_elementresize_handler*/ ctx[5].call(nav));
    			add_location(nav, file$5, 30, 4, 647);

    			attr_dev(div, "class", div_class_value = "row " + (/*scrollY*/ ctx[0] >= /*$globalSizes*/ ctx[1].heroH
    			? "fixed"
    			: "") + " svelte-6vryo9");

    			add_location(div, file$5, 29, 0, 578);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, nav);
    			append_dev(nav, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			nav_resize_listener = add_resize_listener(nav, /*nav_elementresize_handler*/ ctx[5].bind(nav));

    			if (!mounted) {
    				dispose = listen_dev(window, "scroll", () => {
    					scrolling = true;
    					clearTimeout(scrolling_timeout);
    					scrolling_timeout = setTimeout(clear_scrolling, 100);
    					/*onwindowscroll*/ ctx[3]();
    				});

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*scrollY*/ 1 && !scrolling) {
    				scrolling = true;
    				clearTimeout(scrolling_timeout);
    				scrollTo(window.pageXOffset, /*scrollY*/ ctx[0]);
    				scrolling_timeout = setTimeout(clear_scrolling, 100);
    			}

    			if (dirty & /*NAV_ITEMS, animateScroll, $globalSizes*/ 6) {
    				each_value = /*NAV_ITEMS*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*scrollY, $globalSizes*/ 3 && div_class_value !== (div_class_value = "row " + (/*scrollY*/ ctx[0] >= /*$globalSizes*/ ctx[1].heroH
    			? "fixed"
    			: "") + " svelte-6vryo9")) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			nav_resize_listener();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let $globalSizes;
    	validate_store(globalSizes, "globalSizes");
    	component_subscribe($$self, globalSizes, $$value => $$invalidate(1, $globalSizes = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Nav", slots, []);

    	const NAV_ITEMS = [
    		{ name: "Back to Top ", element: "top" },
    		{
    			name: "Where to find me",
    			element: "#section-find"
    		},
    		{
    			name: "My Studies",
    			element: "#section-studies"
    		},
    		{
    			name: "About this project",
    			element: "#section-about"
    		}
    	];

    	let scrollY;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Nav> was created with unknown prop '${key}'`);
    	});

    	function onwindowscroll() {
    		$$invalidate(0, scrollY = window.pageYOffset);
    	}

    	const click_handler = item => item.element === "top"
    	? scrollToTop()
    	: scrollTo$1({
    			element: item.element,
    			offset: -$globalSizes.navbarH
    		});

    	function nav_elementresize_handler() {
    		$globalSizes.navbarH = this.clientHeight;
    		globalSizes.set($globalSizes);
    	}

    	$$self.$capture_state = () => ({
    		animateScroll,
    		globalSizes,
    		NAV_ITEMS,
    		scrollY,
    		$globalSizes
    	});

    	$$self.$inject_state = $$props => {
    		if ("scrollY" in $$props) $$invalidate(0, scrollY = $$props.scrollY);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		scrollY,
    		$globalSizes,
    		NAV_ITEMS,
    		onwindowscroll,
    		click_handler,
    		nav_elementresize_handler
    	];
    }

    class Nav extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Nav",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/Section.svelte generated by Svelte v3.38.3 */

    const file$4 = "src/Section.svelte";
    const get_content_slot_changes = dirty => ({});
    const get_content_slot_context = ctx => ({});

    // (6:25) No content
    function fallback_block(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("No content");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(6:25) No content",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div;
    	let div_id_value;
    	let current;
    	const content_slot_template = /*#slots*/ ctx[2].content;
    	const content_slot = create_slot(content_slot_template, ctx, /*$$scope*/ ctx[1], get_content_slot_context);
    	const content_slot_or_fallback = content_slot || fallback_block(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (content_slot_or_fallback) content_slot_or_fallback.c();
    			attr_dev(div, "class", "row section");
    			attr_dev(div, "id", div_id_value = /*$$props*/ ctx[0].id);
    			add_location(div, file$4, 4, 0, 21);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (content_slot_or_fallback) {
    				content_slot_or_fallback.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (content_slot) {
    				if (content_slot.p && (!current || dirty & /*$$scope*/ 2)) {
    					update_slot(content_slot, content_slot_template, ctx, /*$$scope*/ ctx[1], !current ? -1 : dirty, get_content_slot_changes, get_content_slot_context);
    				}
    			}

    			if (!current || dirty & /*$$props*/ 1 && div_id_value !== (div_id_value = /*$$props*/ ctx[0].id)) {
    				attr_dev(div, "id", div_id_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(content_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(content_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (content_slot_or_fallback) content_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Section", slots, ['content']);

    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("$$scope" in $$new_props) $$invalidate(1, $$scope = $$new_props.$$scope);
    	};

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [$$props, $$scope, slots];
    }

    class Section extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Section",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/sections/About.svelte generated by Svelte v3.38.3 */

    const file$3 = "src/sections/About.svelte";

    function create_fragment$3(ctx) {
    	let div;
    	let h2;
    	let t1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			h2.textContent = "About This Project";
    			t1 = text("\n    content");
    			add_location(h2, file$3, 5, 4, 49);
    			attr_dev(div, "class", "container");
    			add_location(div, file$3, 4, 0, 21);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			append_dev(div, t1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("About", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<About> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class About extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "About",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/sections/Find.svelte generated by Svelte v3.38.3 */
    const file$2 = "src/sections/Find.svelte";

    function create_fragment$2(ctx) {
    	let scrolling = false;

    	let clear_scrolling = () => {
    		scrolling = false;
    	};

    	let scrolling_timeout;
    	let div;
    	let h2;
    	let t1;
    	let div_style_value;
    	let mounted;
    	let dispose;
    	add_render_callback(/*onwindowscroll*/ ctx[2]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			h2.textContent = "Where to Find Me";
    			t1 = text("\n    content");
    			add_location(h2, file$2, 8, 4, 236);
    			attr_dev(div, "class", "container");

    			attr_dev(div, "style", div_style_value = /*scrollY*/ ctx[0] >= /*$globalSizes*/ ctx[1].heroH
    			? `margin-top: ${/*$globalSizes*/ ctx[1].navbarH}px`
    			: "");

    			add_location(div, file$2, 7, 0, 123);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			append_dev(div, t1);

    			if (!mounted) {
    				dispose = listen_dev(window, "scroll", () => {
    					scrolling = true;
    					clearTimeout(scrolling_timeout);
    					scrolling_timeout = setTimeout(clear_scrolling, 100);
    					/*onwindowscroll*/ ctx[2]();
    				});

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*scrollY*/ 1 && !scrolling) {
    				scrolling = true;
    				clearTimeout(scrolling_timeout);
    				scrollTo(window.pageXOffset, /*scrollY*/ ctx[0]);
    				scrolling_timeout = setTimeout(clear_scrolling, 100);
    			}

    			if (dirty & /*scrollY, $globalSizes*/ 3 && div_style_value !== (div_style_value = /*scrollY*/ ctx[0] >= /*$globalSizes*/ ctx[1].heroH
    			? `margin-top: ${/*$globalSizes*/ ctx[1].navbarH}px`
    			: "")) {
    				attr_dev(div, "style", div_style_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $globalSizes;
    	validate_store(globalSizes, "globalSizes");
    	component_subscribe($$self, globalSizes, $$value => $$invalidate(1, $globalSizes = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Find", slots, []);
    	let scrollY;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Find> was created with unknown prop '${key}'`);
    	});

    	function onwindowscroll() {
    		$$invalidate(0, scrollY = window.pageYOffset);
    	}

    	$$self.$capture_state = () => ({ globalSizes, scrollY, $globalSizes });

    	$$self.$inject_state = $$props => {
    		if ("scrollY" in $$props) $$invalidate(0, scrollY = $$props.scrollY);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [scrollY, $globalSizes, onwindowscroll];
    }

    class Find extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Find",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/sections/Studies.svelte generated by Svelte v3.38.3 */
    const file$1 = "src/sections/Studies.svelte";

    function create_fragment$1(ctx) {
    	let scrolling = false;

    	let clear_scrolling = () => {
    		scrolling = false;
    	};

    	let scrolling_timeout;
    	let div;
    	let h2;
    	let font;
    	let t0;
    	let t1;
    	let t2;
    	let mounted;
    	let dispose;
    	add_render_callback(/*onwindowscroll*/ ctx[1]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			font = svg_element("font");
    			t0 = text("My");
    			t1 = text(" Studies");
    			t2 = text("\n    content");
    			attr_dev(font, "class", "font-light");
    			add_location(font, file$1, 8, 8, 158);
    			add_location(h2, file$1, 8, 4, 154);
    			attr_dev(div, "class", "container");
    			add_location(div, file$1, 7, 0, 126);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			append_dev(h2, font);
    			append_dev(font, t0);
    			append_dev(h2, t1);
    			append_dev(div, t2);

    			if (!mounted) {
    				dispose = listen_dev(window, "scroll", () => {
    					scrolling = true;
    					clearTimeout(scrolling_timeout);
    					scrolling_timeout = setTimeout(clear_scrolling, 100);
    					/*onwindowscroll*/ ctx[1]();
    				});

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*scrollY*/ 1 && !scrolling) {
    				scrolling = true;
    				clearTimeout(scrolling_timeout);
    				scrollTo(window.pageXOffset, /*scrollY*/ ctx[0]);
    				scrolling_timeout = setTimeout(clear_scrolling, 100);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Studies", slots, []);
    	let scrollY;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Studies> was created with unknown prop '${key}'`);
    	});

    	function onwindowscroll() {
    		$$invalidate(0, scrollY = window.pageYOffset);
    	}

    	$$self.$capture_state = () => ({ globalSizes, scrollY });

    	$$self.$inject_state = $$props => {
    		if ("scrollY" in $$props) $$invalidate(0, scrollY = $$props.scrollY);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [scrollY, onwindowscroll];
    }

    class Studies extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Studies",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.38.3 */
    const file = "src/App.svelte";

    // (12:2) <svelte:fragment slot="content">
    function create_content_slot_2(ctx) {
    	let find;
    	let current;
    	find = new Find({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(find.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(find, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(find.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(find.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(find, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_content_slot_2.name,
    		type: "slot",
    		source: "(12:2) <svelte:fragment slot=\\\"content\\\">",
    		ctx
    	});

    	return block;
    }

    // (17:2) <svelte:fragment slot="content">
    function create_content_slot_1(ctx) {
    	let about;
    	let current;
    	about = new About({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(about.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(about, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(about.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(about.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(about, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_content_slot_1.name,
    		type: "slot",
    		source: "(17:2) <svelte:fragment slot=\\\"content\\\">",
    		ctx
    	});

    	return block;
    }

    // (22:2) <svelte:fragment slot="content">
    function create_content_slot(ctx) {
    	let studies;
    	let current;
    	studies = new Studies({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(studies.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(studies, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(studies.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(studies.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(studies, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_content_slot.name,
    		type: "slot",
    		source: "(22:2) <svelte:fragment slot=\\\"content\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let hero;
    	let t0;
    	let nav;
    	let t1;
    	let section0;
    	let t2;
    	let section1;
    	let t3;
    	let section2;
    	let current;

    	hero = new Hero({
    			props: { test: "this is var" },
    			$$inline: true
    		});

    	nav = new Nav({ $$inline: true });

    	section0 = new Section({
    			props: {
    				id: "section-find",
    				$$slots: { content: [create_content_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	section1 = new Section({
    			props: {
    				id: "section-about",
    				$$slots: { content: [create_content_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	section2 = new Section({
    			props: {
    				id: "section-studies",
    				$$slots: { content: [create_content_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(hero.$$.fragment);
    			t0 = space();
    			create_component(nav.$$.fragment);
    			t1 = space();
    			create_component(section0.$$.fragment);
    			t2 = space();
    			create_component(section1.$$.fragment);
    			t3 = space();
    			create_component(section2.$$.fragment);
    			attr_dev(main, "class", "svelte-3pt87m");
    			add_location(main, file, 7, 0, 181);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(hero, main, null);
    			append_dev(main, t0);
    			mount_component(nav, main, null);
    			append_dev(main, t1);
    			mount_component(section0, main, null);
    			append_dev(main, t2);
    			mount_component(section1, main, null);
    			append_dev(main, t3);
    			mount_component(section2, main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const section0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				section0_changes.$$scope = { dirty, ctx };
    			}

    			section0.$set(section0_changes);
    			const section1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				section1_changes.$$scope = { dirty, ctx };
    			}

    			section1.$set(section1_changes);
    			const section2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				section2_changes.$$scope = { dirty, ctx };
    			}

    			section2.$set(section2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(hero.$$.fragment, local);
    			transition_in(nav.$$.fragment, local);
    			transition_in(section0.$$.fragment, local);
    			transition_in(section1.$$.fragment, local);
    			transition_in(section2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(hero.$$.fragment, local);
    			transition_out(nav.$$.fragment, local);
    			transition_out(section0.$$.fragment, local);
    			transition_out(section1.$$.fragment, local);
    			transition_out(section2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(hero);
    			destroy_component(nav);
    			destroy_component(section0);
    			destroy_component(section1);
    			destroy_component(section2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Hero, Nav, Section, Find, About, Studies });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
