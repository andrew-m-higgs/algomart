import { CollectibleWithDetails } from '@algomart/schemas'
import useTranslation from 'next-translate/useTranslation'

import css from './nft-template.module.css'

import AlertMessage from '@/components/alert-message/alert-message'
import AppLink from '@/components/app-link/app-link'
import ButtonGroup from '@/components/button-group'
import ExternalLink from '@/components/external-link'
import Heading from '@/components/heading'
import LinkButton from '@/components/link-button'
import MediaGallery from '@/components/media-gallery/media-gallery'
import ReleaseDescription from '@/components/release-details/sections/release-description'
import { Environment } from '@/environment'
import { isAfterNow } from '@/utils/date-time'
import { urls } from '@/utils/urls'

export interface NFTTemplateProps {
  collectible: CollectibleWithDetails
  userAddress?: string
}

function getTransferrableStatus(
  collectible: CollectibleWithDetails,
  currentUserAddress?: string
) {
  if (!currentUserAddress) return 'noUser'
  if (collectible.currentOwnerAddress !== currentUserAddress) return 'notOwner'
  if (collectible.isFrozen) return 'frozen'
  if (isAfterNow(new Date(collectible.transferrableAt))) return 'mintedRecently'
  return null
}

export default function NFTTemplate({
  userAddress,
  collectible,
}: NFTTemplateProps) {
  const { t } = useTranslation()
  const transferrableStatus = getTransferrableStatus(collectible, userAddress)
  const isTransferrable = transferrableStatus === null
  const transferMessages: Record<
    ReturnType<typeof getTransferrableStatus>,
    string
  > = {
    frozen: t('nft:labels.cannotTransfer.frozen'),
    mintedRecently: t('nft:labels.cannotTransfer.mintedRecently', {
      date: new Date(collectible.transferrableAt).toLocaleString(),
    }),
    noUser: t('nft:labels.cannotTransfer.noUser'),
    notOwner: t('nft:labels.cannotTransfer.notOwner'),
  }
  const transferMessage = transferrableStatus
    ? transferMessages[transferrableStatus]
    : null

  return (
    <div className={css.root}>
      <div className={css.panel}>
        <MediaGallery media={[collectible.image]} />

        <div className={css.panelHeader}>
          <Heading className={css.title}>{collectible.title}</Heading>
          {collectible.collection ? (
            <Heading className={css.subtitle} level={2} size={4}>
              {collectible.collection.name}
            </Heading>
          ) : null}
        </div>

        {userAddress ? (
          <div className={css.panelActions}>
            {/* TODO: enable this for secondary marketplace */}
            <ButtonGroup>
              <LinkButton group="left" size="small" disabled href={urls.home}>
                {t('nft:actions.sellNFT')}
              </LinkButton>
              <LinkButton
                group="right"
                href={urls.nftTransfer
                  .replace(':templateId', collectible.templateId)
                  .replace(':assetId', String(collectible.address))}
                size="small"
                variant="secondary"
                disabled={!isTransferrable}
              >
                {t('nft:actions.transferNFT')}
              </LinkButton>
            </ButtonGroup>

            {transferMessage ? (
              <AlertMessage
                className="mt-5"
                variant="red"
                showBorder
                content={transferMessage}
              />
            ) : null}
          </div>
        ) : null}

        {/* TODO: add tabs for description, activity, listings, and offers */}

        <ReleaseDescription description={collectible.body} />

        <div className={css.nftMeta}>
          <div className={css.nftMetaContent}>
            <ul role="list" className={css.nftMetaList}>
              {collectible.currentOwner ? (
                <li className={css.nftMetaListItem}>
                  <span className={css.nftMetaLabel}>
                    {t('nft:labels.Owner')}
                  </span>
                  <span>
                    <AppLink
                      href={urls.profileShowcase.replace(
                        ':username',
                        collectible.currentOwner
                      )}
                    >
                      @{collectible.currentOwner}
                    </AppLink>
                  </span>
                </li>
              ) : null}
              {/* TODO: add publisher details */}
              {collectible.collection ? (
                <li className={css.nftMetaListItem}>
                  <span className={css.nftMetaLabel}>
                    {t('nft:labels.Collection')}
                  </span>
                  <span>{collectible.collection.name}</span>
                </li>
              ) : null}
              <li className={css.nftMetaListItem}>
                <span className={css.nftMetaLabel}>
                  {t('nft:labels.Edition')}
                </span>
                <span>
                  {t('nft:labels.editionX', {
                    edition: collectible.edition,
                    totalEditions: collectible.totalEditions,
                  })}
                </span>
              </li>
              {collectible.rarity ? (
                <li className={css.nftMetaListItem}>
                  <span className={css.nftMetaLabel}>
                    {t('nft:labels.Rarity')}
                  </span>
                  <span>{collectible.rarity.name}</span>
                </li>
              ) : null}
              <li className={css.nftMetaListItem}>
                <span className={css.nftMetaLabel}>
                  {t('nft:labels.Address')}
                </span>
                <span>
                  <ExternalLink
                    href={`${Environment.algoExplorerBaseUrl}/asset/${collectible.address}`}
                  >
                    {collectible.address}
                  </ExternalLink>
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}