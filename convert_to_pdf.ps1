$ppt = New-Object -ComObject PowerPoint.Application
$ppt.Visible = [Microsoft.Office.Core.MsoTriState]::msoTrue
$presentation = $ppt.Presentations.Open("C:\Users\brand\clawd-crowdwave\CROWDWAVE_DECK_V4.pptx")
$presentation.SaveAs("C:\Users\brand\clawd-crowdwave\CROWDWAVE_DECK_V4.pdf", 32)
$presentation.Close()
$ppt.Quit()
Write-Host "PDF created"
