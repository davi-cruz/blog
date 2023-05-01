import * as React from "react"

const Footer = () => {
    return (
        <div id="footer" class="page__footer">
            <footer>
                <div class="page__footer-follow">
                    <ul class="social-icons">
                        <li>
                            <strong>Siga:</strong>
                        </li>
                        <li>
                            <a href="https://www.linkedin.com/in/davicruz" rel="nofollow noopener noreferrer">
                                <i class="fab fa-fw fa-linkedin" aria-hidden="true"></i> Linkedin
                            </a>
                        </li>
                        <li>
                            <a href="https://twitter.com/zerahzurc" rel="nofollow noopener noreferrer">
                                <i class="fab fa-fw fa-twitter-square" aria-hidden="true"></i> Twitter
                            </a>
                        </li>
                        <li>
                            <a href="https://github.com/davi-cruz" rel="nofollow noopener noreferrer">
                                <i class="fab fa-fw fa-github" aria-hidden="true"></i> GitHub
                            </a>
                        </li>
                        <li>
                            <a href="/feed.xml">
                                <i class="fas fa-fw fa-rss-square" aria-hidden="true"></i> Feed
                            </a>
                        </li>
                        <li>
                            <a href="https://davicruz.com/termos-e-privacidade" rel="nofollow noopener noreferrer">
                                <i class="fas fa-user-shield" aria-hidden="true"></i> Termos de uso e Política Privacidade
                            </a>
                        </li>
                    </ul>
                </div>
                <div class="page__footer-copyright">
                    © {new Date().getFullYear()} Davi Cruz.
                    Desenvolvido com <a href="https://www.gatsbyjs.com">Gatsby</a> &amp;
                    &nbsp;<a href="https://mademistakes.com/work/minimal-mistakes-jekyll-theme/" rel="nofollow">Minimal Mistakes</a>.
                </div>
            </footer>
        </div>
    )
}

export default Footer
