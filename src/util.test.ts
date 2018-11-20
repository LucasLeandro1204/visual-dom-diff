import {
    compareArrays,
    compareNodes,
    getAncestorCount,
    isComment,
    isDocumentFragment,
    isElement,
    isText,
    never
} from './util'

const text = document.createTextNode('text')
const identicalText = document.createTextNode('text')
const differentText = document.createTextNode('different text')
const span = document.createElement('SPAN')
const identicalSpan = document.createElement('SPAN')
const differentAttributeNamesSpan = document.createElement('SPAN')
const differentAttributeValuesSpan = document.createElement('SPAN')
const differentChildNodesSpan = document.createElement('SPAN')
const video = document.createElement('VIDEO')
const comment = document.createComment('comment')
const identicalComment = document.createComment('comment')
const differentComment = document.createComment('different comment')
const fragment = document.createDocumentFragment()
const anotherFragment = document.createDocumentFragment()

span.setAttribute('data-a', 'a')
span.setAttribute('data-b', 'b')
identicalSpan.setAttribute('data-b', 'b')
identicalSpan.setAttribute('data-a', 'a')
differentAttributeNamesSpan.setAttribute('data-a', 'a')
differentAttributeNamesSpan.setAttribute('data-b', 'b')
differentAttributeNamesSpan.setAttribute('data-c', 'c')
differentAttributeValuesSpan.setAttribute('data-a', 'different a')
differentAttributeValuesSpan.setAttribute('data-b', 'different b')
differentChildNodesSpan.setAttribute('data-a', 'a')
differentChildNodesSpan.setAttribute('data-b', 'b')
differentChildNodesSpan.appendChild(document.createTextNode('different'))

describe('isText', () => {
    test('return true given a text node', () => {
        expect(isText(text)).toBe(true)
    })
    test('return false given a SPAN', () => {
        expect(isText(span)).toBe(false)
    })
    test('return false given a document fragment', () => {
        expect(isText(fragment)).toBe(false)
    })
    test('return false given a comment', () => {
        expect(isText(comment)).toBe(false)
    })
})

describe('isElement', () => {
    test('return false given a text node', () => {
        expect(isElement(text)).toBe(false)
    })
    test('return true given a SPAN', () => {
        expect(isElement(span)).toBe(true)
    })
    test('return false given a document fragment', () => {
        expect(isElement(fragment)).toBe(false)
    })
    test('return false given a comment', () => {
        expect(isElement(comment)).toBe(false)
    })
})

describe('isDocumentFragment', () => {
    test('return false given a text node', () => {
        expect(isDocumentFragment(text)).toBe(false)
    })
    test('return false given a SPAN', () => {
        expect(isDocumentFragment(span)).toBe(false)
    })
    test('return true given a document fragment', () => {
        expect(isDocumentFragment(fragment)).toBe(true)
    })
    test('return false given a comment', () => {
        expect(isDocumentFragment(comment)).toBe(false)
    })
})

describe('isComment', () => {
    test('return false given a text node', () => {
        expect(isComment(text)).toBe(false)
    })
    test('return false given a SPAN', () => {
        expect(isComment(span)).toBe(false)
    })
    test('return true given a document fragment', () => {
        expect(isComment(fragment)).toBe(false)
    })
    test('return true given a comment', () => {
        expect(isComment(comment)).toBe(true)
    })
})

describe('compareArrays', () => {
    test('empty arrays', () => {
        expect(compareArrays([], [])).toBe(true)
    })
    test('different length', () => {
        expect(compareArrays([1], [1, 2])).toBe(false)
    })
    test('different item types', () => {
        expect(compareArrays([1, 2], [1, '2'])).toBe(false)
    })
    test('identical arrays', () => {
        expect(compareArrays([1, '2', text], [1, '2', text])).toBe(true)
    })
})

describe('compareNodes', () => {
    describe('shallow', () => {
        test('different node types', () => {
            expect(compareNodes(text, span)).toBe(false)
        })
        test('different node names', () => {
            expect(compareNodes(video, span)).toBe(false)
        })
        test('different comment nodes', () => {
            expect(compareNodes(comment, differentComment)).toBe(false)
        })
        test('identical comment nodes', () => {
            expect(compareNodes(comment, identicalComment)).toBe(true)
        })
        test('different text nodes', () => {
            expect(compareNodes(text, differentText)).toBe(false)
        })
        test('identical text nodes', () => {
            expect(compareNodes(text, identicalText)).toBe(true)
        })
        test('elements with different attribute names', () => {
            expect(compareNodes(span, differentAttributeNamesSpan)).toBe(false)
        })
        test('elements with different attribute values', () => {
            expect(compareNodes(span, differentAttributeValuesSpan)).toBe(false)
        })
        test('elements with different childNodes', () => {
            expect(compareNodes(span, differentChildNodesSpan)).toBe(true)
        })
        test('identical elements', () => {
            expect(compareNodes(span, identicalSpan)).toBe(true)
        })
        test('document fragments', () => {
            expect(compareNodes(fragment, anotherFragment)).toBe(true)
        })
    })
    describe('deep', () => {
        const rootNode = document.createDocumentFragment()
        const div = document.createElement('DIV')
        const p = document.createElement('P')
        const em = document.createElement('EM')
        const strong = document.createElement('STRONG')
        rootNode.append(div, p)
        p.append(em, strong)
        em.textContent = 'em'
        strong.textContent = 'strong'

        test('identical nodes', () => {
            expect(
                compareNodes(
                    rootNode.cloneNode(true),
                    rootNode.cloneNode(true),
                    true
                )
            ).toBe(true)
        })
        test('extraneous child', () => {
            const differentRootNode = rootNode.cloneNode(true)
            ;((differentRootNode.lastChild as Node)
                .lastChild as Node).appendChild(
                document.createTextNode('different')
            )
            expect(
                compareNodes(rootNode.cloneNode(true), differentRootNode, true)
            ).toBe(false)
        })
        test('child with a different attribute', () => {
            const differentRootNode = rootNode.cloneNode(true)
            ;((differentRootNode.lastChild as Node)
                .lastChild as Element).setAttribute('data-a', 'a')
            expect(
                compareNodes(rootNode.cloneNode(true), differentRootNode, true)
            ).toBe(false)
        })
    })
})

describe('getAncestorCount', () => {
    const d = document.createElement('DIV')
    const p = document.createElement('P')
    const u = document.createElement('U')
    const t = document.createElement('text')

    d.appendChild(p)
    p.appendChild(u)
    u.appendChild(t)

    test('node: text, root: null', () => {
        expect(getAncestorCount(t)).toBe(3)
    })
    test('node: U, root: null', () => {
        expect(getAncestorCount(u)).toBe(2)
    })
    test('node: P, root: null', () => {
        expect(getAncestorCount(p)).toBe(1)
    })
    test('node: DIV, root: null', () => {
        expect(getAncestorCount(d)).toBe(0)
    })

    test('node: text, root: DIV', () => {
        expect(getAncestorCount(t, d)).toBe(3)
    })
    test('node: U, root: DIV', () => {
        expect(getAncestorCount(u, d)).toBe(2)
    })
    test('node: P, root: DIV', () => {
        expect(getAncestorCount(p, d)).toBe(1)
    })
    test('node: DIV, root: DIV', () => {
        expect(getAncestorCount(d, d)).toBe(0)
    })

    test('node: text, root: P', () => {
        expect(getAncestorCount(t, p)).toBe(2)
    })
    test('node: U, root: P', () => {
        expect(getAncestorCount(u, p)).toBe(1)
    })
    test('node: P, root: P', () => {
        expect(getAncestorCount(p, p)).toBe(0)
    })
    test('node: DIV, root: P', () => {
        expect(getAncestorCount(d, p)).toBe(0)
    })

    test('node: text, root: U', () => {
        expect(getAncestorCount(t, u)).toBe(1)
    })
    test('node: U, root: U', () => {
        expect(getAncestorCount(u, u)).toBe(0)
    })
    test('node: P, root: U', () => {
        expect(getAncestorCount(p, u)).toBe(1)
    })
    test('node: DIV, root: U', () => {
        expect(getAncestorCount(d, u)).toBe(0)
    })

    test('node: text, root: text', () => {
        expect(getAncestorCount(t, t)).toBe(0)
    })
    test('node: U, root: text', () => {
        expect(getAncestorCount(u, t)).toBe(2)
    })
    test('node: P, root: text', () => {
        expect(getAncestorCount(p, t)).toBe(1)
    })
    test('node: DIV, root: text', () => {
        expect(getAncestorCount(d, t)).toBe(0)
    })
})

describe('never', () => {
    test('default message', () => {
        expect(() => never()).toThrowError(
            'visual-dom-diff: Should never happen'
        )
    })
    test('custom message', () => {
        expect(() => never('Custom message')).toThrowError('Custom message')
    })
})
