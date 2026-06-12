import './ProgressBar.css'

function ProgressBar({ currentStep, totalSteps }) {
  const progress = (currentStep / totalSteps) * 100

  return (
    <div className="progress-bar">
      <div className="progress-bar-track">
        <div
          className="progress-bar-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="progress-bar-info">
        <span className="progress-bar-step">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="progress-bar-percent">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  )
}

export default ProgressBar