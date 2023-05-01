/**
 * Bio component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.com/docs/how-to/querying-data/use-static-query/
 */

import * as React from "react"
import { useStaticQuery, graphql } from "gatsby"
import { StaticImage } from "gatsby-plugin-image"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faTwitterSquare, faGithub, faLinkedin} from "@fortawesome/free-brands-svg-icons"

const Bio = () => {
  const data = useStaticQuery(graphql`
    query BioQuery {
      site {
        siteMetadata {
          author {
            name
            summary
            locality
          }
          social {
            twitter
            github
            linkedin
          }
          siteUrl
        }
      }
    }
  `)

  // Set these values by editing "siteMetadata" in gatsby-config.js
  const author = data.site.siteMetadata?.author
  const social = data.site.siteMetadata?.social
  const siteUrl = data.site.siteMetadata?.siteUrl

  return (
    <div class="sidebar sticky">
      <div itemscope itemtype="https://schema.org/Person" class="h-card">
        <div class="author__avatar">
          <a href={siteUrl}>
            <StaticImage
              className="u-photo"
              formats={["auto", "webp", "avif"]}
              src="../images/profile-pic.jpg"
              maxWidth={98}
              maxHeight={98}
              alt={author?.name}
            />
          </a>
        </div>
        <div class="author__content">
          <h3 class="author__name p-name" itemprop="name">
            <a class="u-url" rel="me" href={siteUrl} itemprop="url">{author.name}</a>
          </h3>
          <div class="author__bio p-note" itemprop="description">
            <p>{author.summary}</p>
          </div>
        </div>
        <div class="author__urls-wrapper">
          <button class="btn btn--inverse">Siga</button>
          <ul class="author__urls social-icons">
            <li itemprop="homeLocation" itemscope itemtype="https://schema.org/Place">
              <i class="fas fa-fw fa-map-marker-alt" aria-hidden="true"></i>
              <span itemprop="name"class="p-locality">São Paulo, BR</span>
            </li>
            <li>
              <a href={`https://linkedin.com/in/${social?.linkedin || ``}`} rel="nofollow noopener noreferrer me" itemprop="sameAs">
                <FontAwesomeIcon icon={faLinkedin} className="fa-fw" />
                <span class="label">Linkedin</span>
              </a>
            </li>
            <li>
              <a href={`https://twitter.com/${social?.twitter || ``}`} rel="nofollow noopener noreferrer me" itemprop="sameAs">
                <FontAwesomeIcon icon={faTwitterSquare} className="fa-fw" />
                <span class="label">Twitter</span>
              </a>
            </li>
            <li>
              <a href={`https://github.com/${social?.github || ``}`} rel="nofollow noopener noreferrer me" itemprop="sameAs">
                
                <i class="fab fa-fw fa-github" aria-hidden="true"></i>
                <span class="label">GitHub</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Bio
