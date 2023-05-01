import * as React from "react"
import { Link } from "gatsby"
import Footer from "./footer"
import Masthead from "./masthead"
import Bio from "./bio"

const Layout = ({ children }) => {
  return (
    <div>
      <nav class="skip-links">
        <ul>
          <li><a href="#site-nav" class="screen-reader-shortcut">Pular para navegação primária</a></li>
          <li><a href="#main" class="screen-reader-shortcut">Pular para conteúdo</a></li>
          <li><a href="#footer" class="screen-reader-shortcut">Pular para rodapé</a></li>
        </ul>
      </nav>
      <Masthead />
      <div class="initial-content">
        <div id="main" role="main">
          <Bio />
          {children}
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Layout
