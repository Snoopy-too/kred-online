import React from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

const ManualViewer: React.FC = () => {
  const { t } = useTranslation(['manual', 'common']);

  return (
    <div className="manual-viewer">
      {/* Language Switcher Header */}
      <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1000 }}>
        <LanguageSwitcher />
      </div>

      {/* Cover Page */}
      <div className="container-md a4page">
        <div className="row">
          <div className="col-12 text-center">
            <img src="/images/KRED/manual/logo.png" alt="KRED Logo" className="img-fluid w-75" />
            <h2>{t('manual:cover.tagline')}</h2>
          </div>
        </div>

        <div className="row">
          <div className="col-12 text-center px-3">
            <p>{t('manual:cover.intro1')}</p>
            <p>{t('manual:cover.intro2')}</p>
            <p>{t('manual:cover.intro3')}</p>
            <p>{t('manual:cover.intro4')}</p>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="row no-print">
          <div id="contents" className="col-12">
            <h2>{t('manual:contents.title')}</h2>
            <ul>
              <li><a href="#glossary">{t('manual:contents.glossary')}</a></li>
              <li><a href="#objective">{t('manual:contents.objective')}</a></li>
              <li><a href="#setup">{t('manual:contents.setup')}</a></li>
              <li><a href="#pieces">{t('manual:contents.pieces')}</a></li>
              <li><a href="#campaign">{t('manual:contents.campaign')}</a></li>
              <ul>
                <li><a href="#play">{t('manual:contents.play')}</a></li>
                <li><a href="#receipt">{t('manual:contents.receipt')}</a></li>
                <li><a href="#challenge">{t('manual:contents.challenge')}</a></li>
              </ul>
              <li><a href="#credibility">{t('manual:contents.credibility')}</a></li>
              <li><a href="#bureaucracy">{t('manual:contents.bureaucracy')}</a></li>
              <li><a href="#winning">{t('manual:contents.winning')}</a></li>
              <li><a href="#concepts">{t('manual:contents.concepts')}</a></li>
              <li><a href="#flowchart">{t('manual:contents.flowchart')}</a></li>
            </ul>
          </div>
        </div>
      </div>

      <hr className="no-print" />

      {/* Glossary */}
      <div id="glossary" className="container-md a4page py-5">
        <div className="row">
          <div className="col-12">
            <h2>
              <u>{t('manual:glossary.title')}</u>
              <a href="#contents" className="no-print">
                <i className="material-icons">arrow_upward</i>
              </a>
            </h2>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-2 text-end" style={{ position: 'relative' }}>
            <br />
            <strong>{t('manual:glossary.mark.name')}</strong>
            <img src="/images/KRED/manual/mark.svg" alt="Mark" style={{ position: 'absolute', bottom: 0, right: 0 }} />
          </div>
          <div className="col-2">
            <br />
            <p>{t('manual:glossary.mark.description')}</p>
          </div>
          <div className="col-2 text-end" style={{ position: 'relative' }}>
            <strong>{t('manual:glossary.heel.name')}</strong>
            <img src="/images/KRED/manual/heel.svg" alt="Heel" style={{ position: 'absolute', bottom: 0, right: 0 }} />
          </div>
          <div className="col-2">
            <p>{t('manual:glossary.heel.description')}</p>
          </div>
          <div className="col-2" style={{ position: 'relative' }}>
            <img src="/images/KRED/manual/pawn.svg" alt="Pawn" style={{ position: 'absolute', bottom: 0, right: 0 }} />
          </div>
          <div className="col-2">
            <p><strong>{t('manual:glossary.pawn.name')}</strong><br />{t('manual:glossary.pawn.description')}</p>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <ul>
              <li><strong>{t('common:pieces.pieces')}</strong> - {t('manual:glossary.definitions.pieces')}</li>
              <li><strong>{t('manual:glossary.definitions.domain', { defaultValue: 'A Domain' })}</strong> - {t('manual:glossary.definitions.domain')}</li>
              <li><strong>{t('common:locations.office')}</strong> - {t('manual:glossary.definitions.office')}</li>
              <li><strong>{t('common:locations.rostrum')}</strong> - {t('manual:glossary.definitions.rostrum')}</li>
              <li><strong>{t('common:locations.seat')}</strong> - {t('manual:glossary.definitions.seat')}</li>
              <li><strong>{t('manual:glossary.boardLabels.faction')}</strong> - {t('manual:glossary.definitions.faction')}</li>
              <li><strong>{t('common:locations.community')}</strong> - {t('manual:glossary.definitions.community')}</li>
              <li><strong>{t('manual:glossary.boardLabels.acceptLine')}</strong> - {t('manual:glossary.definitions.acceptLine')}</li>
              <li><strong>{t('manual:glossary.definitions.bank', { defaultValue: 'The Bank' })}</strong> - {t('manual:glossary.definitions.bank')}</li>
              <li><strong>{t('common:phases.campaign')}</strong> - {t('manual:glossary.definitions.campaign')}</li>
              <li><strong>{t('common:phases.bureaucracy')}</strong> - {t('manual:glossary.definitions.bureaucracy')}</li>
              <li><strong>{t('manual:glossary.definitions.honestMove', { defaultValue: 'An Honest move' })}</strong> - {t('manual:glossary.definitions.honestMove')}</li>
              <li><strong>{t('manual:glossary.definitions.dishonestMove', { defaultValue: 'A Dishonest Move' })}</strong> - {t('manual:glossary.definitions.dishonestMove')}</li>
              <li><strong>{t('manual:glossary.definitions.illegal', { defaultValue: 'Illegal' })}</strong> - {t('manual:glossary.definitions.illegal')}</li>
              <li><strong>{t('common:ui.credibility')} Token</strong> - {t('manual:glossary.definitions.credibilityToken')}</li>
              <li><strong>{t('manual:glossary.definitions.tile', { defaultValue: 'A Tile' })}</strong> - {t('manual:glossary.definitions.tile')}</li>
              <li><strong>{t('common:ui.funding')}</strong> - {t('manual:glossary.definitions.funding')}</li>
            </ul>
          </div>
        </div>
      </div>

      <hr className="no-print" />

      {/* Setup */}
      <div id="setup" className="container-md a4page py-5">
        <h2 id="objective">
          <u>{t('manual:setup.objectiveTitle')}</u>
          <a href="#contents" className="no-print">
            <i className="material-icons">arrow_upward</i>
          </a>
        </h2>
        <p>{t('manual:setup.objective')}</p>

        <div className="row">
          <div className="col-6">
            <h2>
              <u>{t('manual:setup.title')}</u>
              <a href="#contents" className="no-print">
                <i className="material-icons">arrow_upward</i>
              </a>
            </h2>
            <p>{t('manual:setup.initialSetup')}</p>
            <p>{t('manual:setup.tileDrafting')}</p>
            <p>{t('manual:setup.tileSelection')}</p>

            <img src="/images/KRED/manual/5P_Setup.svg" alt="5-Player Setup" className="img-fluid" />
            <h3 id="setup">{t('manual:setup.setup5p')}</h3>
            {t('manual:setup.setup5pPieces')}
          </div>
          <div className="col-6 text-end">
            <img src="/images/KRED/manual/3P_Setup.svg" alt="3-Player Setup" className="img-fluid" />
            <h3 id="setup">{t('manual:setup.setup3p')}</h3>
            {t('manual:setup.setup3pPieces')}

            <img src="/images/KRED/manual/4P_Setup.svg" alt="4-Player Setup" className="img-fluid" />
            <h3 id="setup">{t('manual:setup.setup4p')}</h3>
            {t('manual:setup.setup4pPieces')}
          </div>
        </div>
      </div>

      <hr className="no-print" />

      {/* Campaign */}
      <div id="campaign" className="container-md a4page py-5">
        <div className="row">
          <div className="col-12">
            <h2>
              <u>{t('manual:campaign.title')}</u>
              <a href="#contents" className="no-print">
                <i className="material-icons">arrow_upward</i>
              </a>
            </h2>
            <h3 id="play" className="text-center">{t('manual:campaign.playTitle')}</h3>
            <p>{t('manual:campaign.play1')}</p>
            <p>{t('manual:campaign.play2')}</p>

            <h3 id="receipt" className="text-center">{t('manual:campaign.receiptTitle')}</h3>
            <p>{t('manual:campaign.receipt1')}<br />{t('manual:campaign.receipt2')}</p>
            <p>{t('manual:campaign.receipt3')}</p>
            <ol>
              <li>{t('manual:campaign.receiptChoice1')}</li>
              <li>{t('manual:campaign.receiptChoice2')}</li>
            </ol>

            <p><u>{t('manual:campaign.exposureTitle')}</u></p>
            <ul>
              <li>{t('manual:campaign.exposureReceiver')}</li>
              <li>{t('manual:campaign.exposureMover')}</li>
            </ul>
          </div>
        </div>

        <div className="row">
          <div className="col-4">
            <div className="alert alert-warning px-2 pt-2 rounded-3 border border-warning shadow small text-center">
              {t('manual:campaign.warning1')}
            </div>
          </div>
          <div className="col-4">
            <div className="alert alert-warning px-2 pt-2 rounded-3 border border-warning shadow small text-center">
              {t('manual:campaign.warning2')}
            </div>
          </div>
          <div className="col-4">
            <div className="alert alert-warning px-2 pt-2 rounded-3 border border-warning shadow small text-center">
              {t('manual:campaign.warning3')}
            </div>
          </div>
        </div>
      </div>

      <hr className="no-print" />

      {/* Bureaucracy */}
      <div id="bureaucracy" className="container-md a4page py-5">
        <h2>
          <u>{t('manual:bureaucracy.title')}</u>
          <a href="#contents" className="no-print">
            <i className="material-icons">arrow_upward</i>
          </a>
        </h2>

        <div className="row">
          <div className="col-9">
            <p>{t('manual:bureaucracy.intro')}</p>
            <p>{t('manual:bureaucracy.usage')}</p>
          </div>
          <div className="col-3">
            <div className="alert alert-warning px-2 pt-2 rounded-3 border border-warning shadow small text-center">
              <p>{t('manual:bureaucracy.sumWarning')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualViewer;
